using System.Globalization;
using Umbraco.Cms.Core.Models.PublishedContent;
using Umbraco.Cms.Core.PropertyEditors;

namespace DateOnly;

public class DateOnlyValueConverter : IPropertyValueConverter
{
    public bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorUiAlias == "UmbDateOnly";

    // Deserialize raw DB value into a usable .NET object (DTO, string, etc.)
    public object? ConvertSourceToIntermediate(
        IPublishedElement owner,
        IPublishedPropertyType propertyType,
        object? source,
        bool preview)
    {
        if (source == null)
        {
            return null;
        }

        string? s = source as string ?? source.ToString();
        if (string.IsNullOrWhiteSpace(s))
        {
            return null;
        }

        // Prefer strict yyyy-MM-dd
        if (System.DateOnly.TryParseExact(s, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dOnly))
        {
            return dOnly;
        }

        // Fallbacks
        if (DateTimeOffset.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces, out var dto))
        {
            return System.DateOnly.FromDateTime(dto.Date);
        }

        if (DateTime.TryParse(s, CultureInfo.InvariantCulture, DateTimeStyles.AllowWhiteSpaces, out var dt))
        {
            return System.DateOnly.FromDateTime(dt.Date);
        }

        return null;
    }

    // Convert the value from ConvertSourceToIntermediate into the final strongly typed value (TimeOnly in this case)
    public object? ConvertIntermediateToObject(IPublishedElement owner, IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel, object? inter, bool preview)
    {
        if (inter == null) throw new NullReferenceException(inter?.ToString());

        if (inter is System.DateOnly)
        {
            return inter;
        }

        return null;
    }

    public PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Element;

    public Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(System.DateOnly);

    public object? ConvertIntermediateToXPath(IPublishedElement owner, IPublishedPropertyType propertyType,
        PropertyCacheLevel referenceCacheLevel, object? inter, bool preview) => throw new NotImplementedException();

    public bool? IsValue(object? value, PropertyValueLevel level) => value is System.DateOnly;
}