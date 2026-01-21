namespace FoodOrderDeliveryAPI.Models
{
    public class RiderSummary
    {
        public int TotalCount { get; set; }
        public int RiderID { get; set; }
        public string RiderName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsOnline { get; set; }
        public bool IsActive { get; set; }
        public int TotalOrders { get; set; }
        public decimal MonthlyEarnings { get; set; }
        public decimal FloatingCash { get; set; }
        public DateTime RegisteredDate { get; set; }

    }
}
