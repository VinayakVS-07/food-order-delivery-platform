namespace FoodOrderDeliveryAPI.Models
{
    public class RestaurantDashboard
    {
        public string UserName { get; set; }
        public bool IsOpen { get; set; }
        public int TodaysOrders { get; set; }
        public int TotalOrders { get; set; }
        public decimal TodaysEarnings { get; set; }
        public decimal WeeklyEarnings { get; set; }
        public decimal MonthlyEarnings { get; set; }
        public decimal TotalEarnings { get; set; }

    }
}
