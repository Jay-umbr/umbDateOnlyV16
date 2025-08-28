# UmbDateOnly

## How to use
1. Install the package
2. Add a new property on your document type
3. Select DateOnly as editor
4. (Optional) Enter custom configration for the data type (e.g., YYYY-MM-DD, DD.MM.YYYY), default (if not set) is YYYY-MM-DD. Date formatting will only be applied in the backoffice
5. Create some new content, using the DateOnly editor select a date for your property by clicking on the date picker, or use the button to auto-select today's date
6. Render date on the front-end - @Model.YourDateProperty should return a DateTime object