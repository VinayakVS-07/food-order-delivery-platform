namespace FoodOrderDeliveryAPI.Models
{
    public class SearchResult
    {
        public string Type { get; set; }
        public int ID { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public decimal? Rating { get; set; }
        public decimal? Price { get; set; }
        public string Category { get; set; }
        public int? RestaurantID { get; set; }
        public string ImageUrl { get; set; }
    }
}
