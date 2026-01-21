using FoodOrderDeliveryAPI.Models;

namespace FoodOrderDeliveryAPI.Services
{
    public interface IJwtTokenService
    {
        string GenerateToken(Users user);
    }
}
