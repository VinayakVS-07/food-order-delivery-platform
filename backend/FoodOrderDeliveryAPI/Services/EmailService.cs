namespace FoodOrderDeliveryAPI.Services
{
    using System.Net;
    using System.Net.Mail;
    using FoodOrderDeliveryAPI.Settings;
    using Microsoft.Extensions.Options;
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                using (var client = new SmtpClient(_settings.Host, _settings.Port))
                {
                    client.EnableSsl = _settings.EnableSsl;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_settings.Username, _settings.Password);
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.Timeout = 20000; // 20s

                    var fromAddress = new MailAddress(_settings.From, _settings.DisplayName);
                    using var mail = new MailMessage
                    {
                        From = fromAddress,
                        Subject = subject,
                        Body = htmlBody,
                        IsBodyHtml = true
                    };

                    mail.To.Add(to);

                    await client.SendMailAsync(mail);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
                throw; 
            }
        }

        public Task SendOtpEmailAsync(string to, string otpCode, int expiryMinutes = 5)
        {
            var subject = "Verify your email - Foodify";
            var body = $@"
            <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 16px; border: 1px solid #eee; border-radius: 8px;'>
                <h2 style='color:#333; text-align:center;'>Email Verification</h2>
                <p>Hi,</p>
                <p>Use the verification code below to complete your sign up on <strong>🍴 Foodify</strong>:</p>
                <div style='text-align:center; margin:24px 0;'>
                    <span style='font-size: 32px; letter-spacing: 6px; font-weight: bold; padding: 12px 24px; border-radius: 6px; border: 1px solid #ccc; display:inline-block;'>
                        {otpCode}
                    </span>
                </div>
                <p>This code is valid for <strong>{expiryMinutes} minutes</strong>.</p>
                <p>If you didn’t request this code, you can safely ignore this email.</p>
                <p style='margin-top:24px; color:#777; font-size:12px;'>© {DateTime.UtcNow.Year} 🍴 Foodify</p>
            </div>
        ";
            return SendEmailAsync(to, subject, body);
        }
        public async Task SendRegistrationSuccessEmailAsync(string to, string fullName, string roleName)
        {
            var subject = "Welcome to Foodify 🎉";

            var roleMessage = roleName switch
            {
                "Customer" => "You can now log in and start ordering your favorite food.",
                "Restaurant" => "Your account is under review. Once approved, you can start receiving orders.",
                "Rider" => "Your account is under review. Once approved, you can start accepting deliveries.",
                _ => "Your account has been created successfully."
            };

            var body = $@"
              <div style='font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #eee; border-radius: 10px;'>
               <h2 style='color:#ff6b6b; text-align:center;'>Welcome to Foodify 🍴</h2>

                <p>Hi <strong>{fullName}</strong>,</p>

                <p>Thank you for registering with <strong>Foodify</strong>.</p>

                <p>{roleMessage}</p>

                <div style='margin: 24px 0; padding: 16px; background:#f9f9f9; border-radius: 8px;'>
                <p style='margin:0;'><strong>Registered Email:</strong> {to}</p>
                <p style='margin:0;'><strong>Role:</strong> {roleName}</p>
                </div>

                <p>If you didn’t create this account, please ignore this email.</p>

                <p style='margin-top: 32px;'>Cheers,<br/>
                <strong>Foodify Team</strong></p>

                <hr style='margin-top: 32px;'/>
                <p style='font-size: 12px; color: #777; text-align:center;'>
                 © {DateTime.UtcNow.Year} Foodify. All rights reserved.
              </p>
             </div>";

            await SendEmailAsync(to, subject, body);
        }
    }
}
