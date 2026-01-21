namespace FoodOrderDeliveryAPI.Models
{
    public class RestaurantOrderStatus
    {
        public long OrderID { get; set; }
        public string OrderStatus { get; set; } = string.Empty;
        public string? ModifiedBy { get; set; }
    }
}
