using FoodOrderDeliveryAPI.Models;

namespace FoodOrderDeliveryAPI.Services
{
    public interface IAIChatService
    {
        Task<AIChatResponse> ProcessUserMessageAsync(int userId, string message);
    }
}
