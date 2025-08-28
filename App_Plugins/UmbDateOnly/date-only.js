class UmbDateOnly extends HTMLElement {
    constructor() {
        super();
        this._value = "";
        this._config = null;
        this._format = "DD of MM, YYYY"; // fallback
        this.attachShadow({ mode: "open" });
        this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; font: inherit; }
        .row { display:flex; gap:.5rem; align-items:center; }
        .hint { opacity:.75; font-size:.875rem; margin:.5rem 0 0; }
        input[type="date"] { padding:.4rem .5rem; }
        button { padding:.35rem .6rem; cursor:pointer; }
      </style>
      <div class="row">
        <input id="inp" type="date" />
        <button id="today" type="button" title="Use today's date">Use today's date</button>
      </div>
      <p class="hint">Selected date: <span id="out">—</span></p>
    `;
    }

    // Umbraco supplies/reads the value
    get value() { return this._value; }
    set value(v) {
        const normalized = this._normalizeIncoming(v);
        if (this._value === normalized) return;
        this._value = normalized;
        this._render();
    }

    get config() { return this._config; }
    set config(cfg) {
        this._config = cfg;
        this._format = this._readConfig("format", this._format);
        this._render();
    }

    connectedCallback() {
        this._inp = this.shadowRoot.getElementById("inp");
        this._out = this.shadowRoot.getElementById("out");

        this.shadowRoot.getElementById("today").addEventListener("click", () => {
            const dt = new Date();
            const yyyy = dt.getFullYear();
            const mm = String(dt.getMonth() + 1).padStart(2, "0");
            const dd = String(dt.getDate()).padStart(2, "0");
            this.value = `${yyyy}-${mm}-${dd}`;
            this._emitChange();
        });

        this._inp.addEventListener("change", () => {
            // should be yyyy-MM-dd from <input type="date">
            this.value = this._inp.value || "";
            this._emitChange();
        });

        this._render();
    }

    _readConfig(alias, fallback) {
        const cfg = this._config;
        if (!cfg) return fallback;

        try {
            if (typeof cfg.getValueByAlias === "function") {
                const v = cfg.getValueByAlias(alias);
                return v != null ? v : fallback;
            }
        } catch {  }

        if (Array.isArray(cfg)) {
            const hit = cfg.find(x => x && x.alias === alias);
            return hit && hit.value != null ? hit.value : fallback;
        }

        if (typeof cfg === "object") {
            const v = cfg[alias];
            return v != null ? v : fallback;
        }

        return fallback;
    }

    // normalize date
    _normalizeIncoming(v) {
        const s = v == null ? "" : String(v).trim();
        if (!s) return "";

        // Already yyyy-MM-dd?
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

        // ISO with time or timezone
        if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
            const d = new Date(s);
            return isNaN(d) ? "" : this._toIsoLocalDate(d);
        }
        const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (slash) {
            const y = Number(slash[3]), m = Number(slash[1]), d = Number(slash[2]);
            if (y && m && d) return this._padIso(y, m, d); // treat as MM/DD/YYYY
        }

        // Fallback
        const d2 = new Date(s);
        return isNaN(d2) ? "" : this._toIsoLocalDate(d2);
    }

    _toIsoLocalDate(d) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${y}-${m}-${day}`;
    }

    _padIso(y, m, d) {
        return `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    }

    _render() {
        if (this._inp) this._inp.value = this._value || "";
        if (this._out) {
            const txt = this._formatDate(this._value, this._format);
            this._out.textContent = this._value && txt ? txt : "—";
        }
    }

    // Tokens: D, DD, M, MM, MMM, MMMM, YY, YYYY
    _formatDate(iso, fmt) {
        if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return "";
        const [y, m, d] = iso.split("-").map(Number);
        if (!y || !m || !d) return "";

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthShort = monthNames.map(n => n.slice(0, 3));
        const pad2 = n => (n < 10 ? "0" + n : String(n));

        let out = String(fmt || "");
        out = out.replace(/YYYY/g, String(y));
        out = out.replace(/YY/g, String(y).slice(-2));
        out = out.replace(/MMMM/g, monthNames[m - 1]);
        out = out.replace(/MMM/g, monthShort[m - 1]);
        out = out.replace(/MM/g, monthNames[m - 1]);
        out = out.replace(/M/g, String(m));
        out = out.replace(/DD/g, pad2(d));
        out = out.replace(/D/g, String(d));
        return out;
    }

    _emitChange() {
        const detail = { value: this._value };
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail }));
        this.dispatchEvent(new CustomEvent("property-value-change", { bubbles: true, detail }));
    }
}

customElements.define("umb-date-only", UmbDateOnly);
