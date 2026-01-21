namespace FoodOrderDeliveryAPI.Models
{
    public class AdminDashboard
    {
        public int TotalOrders { get; set; }
        public int TodaysOrders { get; set; }
        public decimal TotalEarnings { get; set; }
        public decimal TodaysEarnings { get; set; }
        public decimal TotalProfit { get; set; }
        public decimal TodaysProfit { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalRiders { get; set; }
        public int TotalRestaurants { get; set; }
    }
}
