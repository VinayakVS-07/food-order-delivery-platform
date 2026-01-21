namespace FoodOrderDeliveryAPI.Models
{
    public class Cart
    {
        public long CartID { get; set; }
        public int CustomerID { get; set; }
        public int RestaurantID { get; set; }
        public int MenuItemID { get; set; }
        public int Quantity { get; set; }
        public string ItemName { get; set; }
        public decimal UnitPrice { get; set; }
        public string? ImageUrl { get; set; }
        public decimal TotalPrice { get; set; }
        public string RestaurantName { get; set; }
    }
}
