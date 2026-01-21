namespace FoodOrderDeliveryAPI.Models
{
    public class MenuItemAdd
    {
        public int RestaurantID { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public string? Category { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailable { get; set; } = true;
        public string CreatedBy { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
