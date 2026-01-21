namespace FoodOrderDeliveryAPI.Models
{
    public class RecentOrder
    {
        public long OrderID { get; set; }
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
        public int RestaurantID { get; set; }
        public string RestaurantName { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentStatus { get; set; }
        public string OrderStatus { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
