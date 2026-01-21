namespace FoodOrderDeliveryAPI.Models
{
    public class RiderDashboard
    {
        public int TotalOrders { get; set; }
        public int TodayOrders { get; set; }
        public decimal TodayEarnings { get; set; }
        public decimal WeeklyEarnings { get; set; }
        public decimal MonthlyEarnings { get; set; }
        public decimal FloatingCash { get; set; }
    }
}
