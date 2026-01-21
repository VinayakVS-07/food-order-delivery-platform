namespace FoodOrderDeliveryAPI.Models
{
    public class RiderOrderDetail
    {
        public long OrderID { get; set; }
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; }
        public DateTime CreatedAt { get; set; }
        public string DeliveryInstructions { get; set; }

        // Restaurant
        public int RestaurantID { get; set; }
        public string RestaurantName { get; set; }
        public string RestaurantAddress { get; set; }
        public string RestaurantImage { get; set; }
        public string RestaurantPhone { get; set; }

        // Customer
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
        public string CustomerAddress { get; set; }
        public string CustomerPhone { get; set; }

        // Payment
        public string PaymentMethod { get; set; }
        public string PaymentStatus { get; set; }
        public decimal PaymentAmount { get; set; }

        // Rider earning
        public decimal RiderEarning { get; set; }

        // Order items
        public List<OrderItemDetail> OrderItems { get; set; } = new();
    }

    public class OrderItemDetail
    {
        public long OrderItemID { get; set; }
        public long OrderID { get; set; }
        public int MenuItemID { get; set; }
        public string MenuItemName { get; set; }
        public string MenuItemImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
