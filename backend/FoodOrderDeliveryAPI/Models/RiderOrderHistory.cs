namespace FoodOrderDeliveryAPI.Models
{
    public class RiderOrderHistory
    {
        public long OrderID { get; set; }
        public DateTime CreatedAt { get; set; }
        public string OrderStatus { get; set; }
        public decimal TotalAmount { get; set; }

        public string RestaurantName { get; set; }
        public string RestaurantAddress { get; set; }
        public string RestaurantImage { get; set; }

        public string CustomerName { get; set; }
        public string CustomerAddress { get; set; }

        public string PaymentMethod { get; set; }
        public decimal PaymentAmount { get; set; }

        public decimal RiderEarning { get; set; }
    }
}
