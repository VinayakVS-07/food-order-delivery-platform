namespace FoodOrderDeliveryAPI.Models
{
    public class OrderModel
    {
        public int CustomerID { get; set; }
        public int RestaurantID { get; set; }
        public int AddressID { get; set; }
        public decimal TotalAmount { get; set; }
        public string? DeliveryInstructions { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
    }
}
