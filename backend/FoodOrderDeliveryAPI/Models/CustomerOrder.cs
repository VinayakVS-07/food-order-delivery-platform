namespace FoodOrderDeliveryAPI.Models
{
    public class CustomerOrder
    {
        public long OrderID { get; set; }
        public int RestaurantID { get; set; }
        public string RestaurantName { get; set; }
        public decimal TotalAmount { get; set; }
        public string PaymentStatus { get; set; }
        public string OrderStatus { get; set; }
        public string DeliveryInstructions { get; set; }
        public DateTime? EstimatedDeliveryTime { get; set; }
        public DateTime OrderDate { get; set; }

        public int? RiderID { get; set; }
        public string? RiderName { get; set; }
        public string? RiderPhone { get; set; }
        public List<OrderItemDetails> OrderItems { get; set; } = new List<OrderItemDetails>();
    }
    public class OrderItemDetails
    {
        public long OrderItemID { get; set; }
        public int MenuItemID { get; set; }
        public string MenuItemName { get; set; }
        public string ImageUrl { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
