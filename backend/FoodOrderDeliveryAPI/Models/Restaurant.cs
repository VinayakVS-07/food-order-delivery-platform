namespace FoodOrderDeliveryAPI.Models
{
    public class Restaurant
    {
        public int RestaurantID { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string Address { get; set; }
        public string ImageUrl { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Pincode { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public TimeSpan OpeningTime { get; set; }
        public TimeSpan ClosingTime { get; set; }
        public decimal Rating { get; set; }
        public bool IsActive { get; set; }
        public bool IsOpen { get; set; }
    }
}
