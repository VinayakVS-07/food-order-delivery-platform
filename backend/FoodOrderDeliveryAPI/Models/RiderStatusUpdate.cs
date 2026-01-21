namespace FoodOrderDeliveryAPI.Models
{
    public class RiderStatusUpdate
    {
        public int RiderID { get; set; }
        public bool IsOnline { get; set; }
    }

    public class RiderStatusResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
