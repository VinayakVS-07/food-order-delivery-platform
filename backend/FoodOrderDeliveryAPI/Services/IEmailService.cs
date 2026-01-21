namespace FoodOrderDeliveryAPI.Services
{
    public interface IEmailService
    {
        Task SendEmailAsync(string to, string subject, string htmlBody);
        Task SendOtpEmailAsync(string to, string otpCode, int expiryMinutes = 5);
        Task SendRegistrationSuccessEmailAsync(string to, string fullName, string roleName);
    }
}
