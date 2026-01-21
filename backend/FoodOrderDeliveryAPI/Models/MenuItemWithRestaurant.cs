namespace FoodOrderDeliveryAPI.Models
{
    public class MenuItemWithRestaurant
    {
        public int MenuItemID { get; set; }
        public string MenuItemName { get; set; }
        public string Description { get; set; }
        public decimal Price { get; set; }
        public string? MenuImage { get; set; }
        public int RestaurantID { get; set; }
        public string RestaurantName { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
        public string? RestaurantImage { get; set; }
        public decimal? Rating { get; set; }
    }
}
