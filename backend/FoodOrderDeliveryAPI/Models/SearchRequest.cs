namespace FoodOrderDeliveryAPI.Models
{
    public class SearchRequest
    {
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
