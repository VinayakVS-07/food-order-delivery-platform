namespace FoodOrderDeliveryAPI.Models
{
    public class SendOtpRequest
    {
        public string Email { get; set; } = string.Empty;
    }

    public class VerifyOtpRequest
    {
        public string Email { get; set; } = string.Empty;
        public string OtpCode { get; set; } = string.Empty;
    }

    public class OtpResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
