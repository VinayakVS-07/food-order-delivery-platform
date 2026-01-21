namespace FoodOrderDeliveryAPI.Models
{
    public class OrderStatusUpdate
    {
        public long OrderID { get; set; }
        public int RiderID { get; set; }
        public string NewStatus { get; set; }
    }
}
