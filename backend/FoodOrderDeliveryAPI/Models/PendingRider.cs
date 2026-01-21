namespace FoodOrderDeliveryAPI.Models
{
    public class PendingRider
    {

        public int? RiderID { get; set; }
        public int? UserID { get; set; }
        public string? RiderName { get; set; }
        public string? Name { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Status { get; set; }
        public DateTime RegisteredDate { get; set; }
        public bool IsActive { get; set; }
    }

    public class ApproveRiderResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}

