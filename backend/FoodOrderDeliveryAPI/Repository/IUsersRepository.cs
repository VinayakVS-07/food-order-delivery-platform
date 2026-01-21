using FoodOrderDeliveryAPI.Models;

namespace FoodOrderDeliveryAPI.Repository
{
    public interface IUsersRepository
    {
        Task<IEnumerable<Users>> GetAllUsersAsync();
        Task<Users?> GetUserByIdAsync(int userId);
        Task<int> CreateUserAsync(Users user);
        Task<int> UpdateUserAsync(Users user);
        Task<int> ChangeUserPasswordAsync(int userId, string oldPassword, string newPassword);
        Task<int> DeleteUserAsync(int userId);
        Task<Users?> AuthenticateUserAsync(string email);
        Task<int> RegisterUserAsync(Users user);
        Task<IEnumerable<Restaurant>> GetAllActiveRestaurantsAsync();
        Task<IEnumerable<MenuItem>> GetMenuItemsByRestaurantAsync(int restaurantId, string role);
        Task<IEnumerable<SearchResult>> SearchAsync(string searchTerm);
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<IEnumerable<Restaurant>> GetRestaurantsByCategoryAsync(string category);
        Task<bool> AddOrUpdateCartItemAsync(Cart cart);
        Task<IEnumerable<Cart>> GetCartItemsByCustomerAsync(int customerId);
        Task<bool> UpdateCartItemQuantityAsync(long cartId, int quantity);
        Task<bool> RemoveCartItemAsync(long cartId);
        Task<bool> ClearCartByCustomerAsync(int customerId);
        Task<int> GetCartItemCountAsync(int customerId);
        Task<long?> SaveOrderAsync(OrderModel order);
        Task<string> SaveOrderItemsAsync(List<OrderItemModel> orderItems);
        Task<string> SavePaymentAsync(PaymentModel payment);
        Task<IEnumerable<CustomerAddress>> GetCustomerAddressesAsync(int customerId);
        Task<int> AddCustomerAddressAsync(CustomerAddress address);
        Task<IEnumerable<CustomerOrder>> GetOrdersByCustomerIdAsync(int customerId);
        Task<AdminDashboard> GetDashboardAsync();
        Task<IEnumerable<RecentOrder>> GetRecentOrdersAsync(int topN = 10);
        Task<IEnumerable<AdminOrderViewModel>> GetAllOrdersWithDetailsAsync();
        Task<int> UpdateOrderStatusAsync(long orderId, string newStatus, string modifiedBy = null);
        Task<IEnumerable<RiderView>> GetAllRidersAsync();
        Task<int> AssignRiderToOrderAsync(long orderId, int riderId, string modifiedBy);
        Task<RiderDashboard> GetRiderDashboardAsync(int riderId);
        Task<RiderStatusResponse> UpdateRiderStatusAsync(RiderStatusUpdate model);
        Task<IEnumerable<RiderLiveOrder>> GetLiveOrdersForRiderAsync(int riderId);
        Task<RiderOrderDetail> GetRiderOrderDetailsAsync(long orderId, int riderId);
        Task<bool> UpdateOrderStatusByRiderAsync(long orderId, int riderId, string newStatus);
        Task<IEnumerable<RiderOrderHistory>> GetRiderOrderHistoryAsync(int riderId);
        Task<int> GetLiveOrderCountForRiderAsync(int riderId);
        Task<(IEnumerable<RiderSummary> Riders, int TotalCount)> GetRidersAsync(string search, int page, int pageSize);
        Task<bool> SetRiderIsActiveAsync(int riderId, bool isActive, string modifiedBy);
        Task<IEnumerable<PendingRider>> GetPendingRidersAsync();
        Task<ApproveRiderResponse> ApproveRiderAsync(int riderId, string modifiedBy);
        Task<IEnumerable<PendingRider>> GetPendingUserAsync();
        Task<ApproveRiderResponse> ApproveUserAsync(int riderId, string modifiedBy);
        Task<RestaurantDashboard?> GetRestaurantDashboardAsync(int restaurantId);
        Task<Restaurant?> GetRestaurantByUserAsync(int userId);
        Task<RestaurantUser?> GetRestaurantByOwnerAsync(int userId);
        Task<int> AddRestaurantAsync(RestaurantUser restaurant);
        Task<bool> UpdateRestaurantAsync(RestaurantUser restaurant);
        Task<bool> ToggleRestaurantOpenAsync(int restaurantId, bool isOpen);
        Task<bool> UpdateMenuItem(MenuItem item);
        Task<MenuItem?> GetMenuItemById(int menuItemId);
        Task<bool> AddMenuItemAsync(MenuItemAdd item);
        Task<IEnumerable<LiveOrder>> GetLiveOrdersForRestaurantAsync(int restaurantId);
        Task<(bool Success, string Message)> UpdateOrderStatusAsync(RestaurantOrderStatus model);
        Task<IEnumerable<RestaurantOrderHistory>> GetRestaurantOrderHistoryAsync(int restaurantId);
        Task<IEnumerable<MenuItemWithRestaurant>> GetAllMenuItemsWithRestaurantAsync();
        Task<LiveOrderCount> GetActiveOrdersCountAsync();
        Task<LiveOrderCount> GetRestaurantActiveOrdersCountAsync(int restaurantId);
        Task<IEnumerable<Category>> GetDistinctCategoriesAsync();
        Task<bool> UpdateUserProfileImageAsync(long userId, string profileImagePath);
        Task<OtpResponse> SaveEmailOtpAsync(string email, string otpCode, DateTime expiresAt);
        Task<OtpResponse> VerifyEmailOtpAsync(string email, string otpCode);
    }
}
