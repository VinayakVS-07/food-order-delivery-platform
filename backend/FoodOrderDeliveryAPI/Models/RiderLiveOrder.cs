namespace FoodOrderDeliveryAPI.Models
{
    public class RiderLiveOrder
    {
        public long OrderID { get; set; }
        public decimal TotalAmount { get; set; }
        public string OrderStatus { get; set; }
        public DateTime CreatedAt { get; set; }

        // Restaurant Info
        public int RestaurantID { get; set; }
        public string RestaurantName { get; set; }
        public string RestaurantAddress { get; set; }
        public string RestaurantImage { get; set; }
        public string RestaurantPhone { get; set; }

        // Customer Info
        public int CustomerID { get; set; }
        public string CustomerName { get; set; }
        public string CustomerAddress { get; set; }
        public string CustomerPhone { get; set; }
    }
}
