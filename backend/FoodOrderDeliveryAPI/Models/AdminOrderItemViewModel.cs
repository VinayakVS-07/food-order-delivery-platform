namespace FoodOrderDeliveryAPI.Models
{
    public class AdminOrderItemViewModel
    {
        public string ItemName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string ImageUrl { get; set; }
    }

    public class AdminOrderViewModel
    {
        public long OrderID { get; set; }
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
        public int RestaurantID { get; set; }
        public string RestaurantName { get; set; }
        public int? RiderID { get; set; }
        public string? RiderName { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentStatus { get; set; }
        public string OrderStatus { get; set; }
        public string DeliveryInstructions { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<AdminOrderItemViewModel> OrderItems { get; set; }
    }
}
