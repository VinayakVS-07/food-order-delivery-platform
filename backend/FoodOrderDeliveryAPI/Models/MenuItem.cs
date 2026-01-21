namespace FoodOrderDeliveryAPI.Models
{
    public class MenuItem
    {
        public int MenuItemID { get; set; }
        public int RestaurantID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Category { get; set; }
        public decimal Price { get; set; }
        public string ImageUrl { get; set; }
        public bool IsAvailable { get; set; }
        public bool IsActive { get; set; }
        public string? ModifiedBy { get; set; }
    }
}
