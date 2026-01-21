using System.Data;
using Dapper;
using FoodOrderDeliveryAPI.Data;
using FoodOrderDeliveryAPI.Models;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;


namespace FoodOrderDeliveryAPI.Repository
{
    public class UsersRepository : IUsersRepository
    {
        private readonly AppDbContext _context;
        public UsersRepository(AppDbContext context)
        {
            _context = context;
        }
        public async Task<IEnumerable<Users>> GetAllUsersAsync()
        {
            using var connection = _context.CreatesqlConnection();
            var query = "SELECT * FROM Users WHERE IsActive = 1";
            return await connection.QueryAsync<Users>(query);
        }

        public async Task<Users?> GetUserByIdAsync(int userId)
        {
            using var connection = _context.CreatesqlConnection();
            var query = "SELECT * FROM Users WHERE UserID = @UserID";
            return await connection.QueryFirstOrDefaultAsync<Users>(query, new { UserID = userId });
        }

        public async Task<int> CreateUserAsync(Users user)
        {
            using var connection = _context.CreatesqlConnection();
            var query = @"INSERT INTO Users (FirstName, LastName, Password, Email, Phone, RoleID, CreatedBy) 
                          VALUES (@FirstName, @LastName, @Password, @Email, @Phone, @RoleID, @CreatedBy)";
            return await connection.ExecuteAsync(query, user);
        }

        public async Task<int> UpdateUserAsync(Users user)
        {
            using var connection = _context.CreatesqlConnection();
            var query = @"UPDATE Users 
                          SET FirstName=@FirstName, LastName=@LastName, Email=@Email, Phone=@Phone, RoleID=@RoleID, 
                              ModifiedBy=@ModifiedBy, ModifiedAt=GETDATE()
                          WHERE UserID=@UserID";
            return await connection.ExecuteAsync(query, user);
        }


        public async Task<int> ChangeUserPasswordAsync(int userId, string oldPassword, string newPassword)
        {
            using var connection = _context.CreatesqlConnection();
            var parameters = new { UserID = userId, OldPassword = oldPassword, NewPassword = newPassword };
            return await connection.ExecuteAsync("ChangeUserPassword", parameters, commandType: CommandType.StoredProcedure);
        }


        public async Task<int> DeleteUserAsync(int userId)
        {
            using var connection = _context.CreatesqlConnection();
            var query = "UPDATE Users SET IsActive = 0 WHERE UserID = @UserID";
            return await connection.ExecuteAsync(query, new { UserID = userId });
        }


        public async Task<Users?> AuthenticateUserAsync(string email)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var result = await connection.QuerySingleOrDefaultAsync<Users>(
                    "AuthenticateUser",
                    new { Email = email },
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
        }
        public async Task<int> RegisterUserAsync(Users user)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@FirstName", user.FirstName);
                parameters.Add("@LastName", user.LastName);
                parameters.Add("@Password", user.Password);
                parameters.Add("@Email", user.Email);
                parameters.Add("@Phone", user.Phone);
                parameters.Add("@RoleID", user.RoleID);
                parameters.Add("@CreatedBy", user.CreatedBy ?? "System");
                parameters.Add("@Status", user.Status);
                parameters.Add("@IsActive", user.IsActive);

                var result = await connection.ExecuteScalarAsync<int>(
                    "RegisterUser",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
        }
        public async Task<IEnumerable<Restaurant>> GetAllActiveRestaurantsAsync()
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.QueryAsync<Restaurant>(
                "GetAllActiveRestaurants",
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<IEnumerable<MenuItem>> GetMenuItemsByRestaurantAsync(int restaurantId, string role)
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.QueryAsync<MenuItem>(
                "GetMenuItemsByRestaurant",
                new { RestaurantID = restaurantId, Role = role },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }

        public async Task<IEnumerable<SearchResult>> SearchAsync(string searchTerm)
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.QueryAsync<SearchResult>(
                "SearchRestaurantsOrMenuItems",
                new { SearchTerm = searchTerm },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }
        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.QueryAsync<Category>(
                "GetDistinctCategories",
                commandType: CommandType.StoredProcedure
            );
            return result.Select(c => new Category { CategoryName = c.CategoryName ?? string.Empty });
        }
        public async Task<IEnumerable<Restaurant>> GetRestaurantsByCategoryAsync(string category)
        {
            using var connection = _context.CreatesqlConnection();
            {
                return await connection.QueryAsync<Restaurant>(
                    "GetRestaurantsByCategory",
                    new { Category = category },
                    commandType: CommandType.StoredProcedure);
            }
        }
        public async Task<bool> AddOrUpdateCartItemAsync(Cart cart)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var parameters = new DynamicParameters();
                parameters.Add("@CustomerID", cart.CustomerID);
                parameters.Add("@RestaurantID", cart.RestaurantID);
                parameters.Add("@MenuItemID", cart.MenuItemID);
                parameters.Add("@Quantity", cart.Quantity);

                await connection.ExecuteAsync("AddOrUpdateCartItem", parameters, commandType: CommandType.StoredProcedure);
                return true;
            }
        }

        public async Task<IEnumerable<Cart>> GetCartItemsByCustomerAsync(int customerId)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var result = await connection.QueryAsync<Cart>(
                    "GetCartItemsByCustomer",
                    new { CustomerID = customerId },
                    commandType: CommandType.StoredProcedure);
                return result;
            }
        }

        public async Task<bool> UpdateCartItemQuantityAsync(long cartId, int quantity)
        {
            using var connection = _context.CreatesqlConnection();
            {
                await connection.ExecuteAsync("UpdateCartItemQuantity",
                    new { CartID = cartId, Quantity = quantity },
                    commandType: CommandType.StoredProcedure);
                return true;
            }
        }

        public async Task<bool> RemoveCartItemAsync(long cartId)
        {
            using var connection = _context.CreatesqlConnection();
            {
                await connection.ExecuteAsync("RemoveCartItem",
                    new { CartID = cartId },
                    commandType: CommandType.StoredProcedure);
                return true;
            }
        }

        public async Task<bool> ClearCartByCustomerAsync(int customerId)
        {
            using var connection = _context.CreatesqlConnection();
            {
                await connection.ExecuteAsync("ClearCartByCustomer",
                    new { CustomerID = customerId },
                    commandType: CommandType.StoredProcedure);
                return true;
            }
        }
        public async Task<int> GetCartItemCountAsync(int customerId)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var result = await connection.ExecuteScalarAsync<int>(
                    "GetCartItemCount",
                    new { CustomerID = customerId },
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
        }



        public async Task<long?> SaveOrderAsync(OrderModel order)
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "SaveOrder",
                new
                {
                    order.CustomerID,
                    order.RestaurantID,
                    order.AddressID,
                    order.TotalAmount,
                    order.DeliveryInstructions,
                    order.EstimatedDeliveryTime
                },
                commandType: CommandType.StoredProcedure
            );

            return result?.OrderID ?? null;
        }

        public async Task<string> SaveOrderItemsAsync(List<OrderItemModel> orderItems)
        {
            using var connection = _context.CreatesqlConnection();

            var tvp = new DataTable();
            tvp.Columns.Add("OrderID", typeof(long));
            tvp.Columns.Add("MenuItemID", typeof(int));
            tvp.Columns.Add("Quantity", typeof(int));
            tvp.Columns.Add("UnitPrice", typeof(decimal));

            foreach (var item in orderItems)
            {
                tvp.Rows.Add(item.OrderID, item.MenuItemID, item.Quantity, item.UnitPrice);
            }

            var param = new DynamicParameters();
            param.Add("@OrderItems", tvp.AsTableValuedParameter("OrderItemType"));

            var result = await connection.QueryFirstOrDefaultAsync<string>(
                "SaveOrderItems", param, commandType: CommandType.StoredProcedure);

            return result ?? "Failed";
        }

        public async Task<string> SavePaymentAsync(PaymentModel payment)
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.QueryFirstOrDefaultAsync<string>(
                "SavePayment",
                new
                {
                    payment.OrderID,
                    payment.CustomerID,
                    payment.PaymentMethod,
                    payment.TransactionID,
                    payment.Provider,
                    payment.Amount
                },
                commandType: CommandType.StoredProcedure
            );
            return result ?? "Failed";
        }
        public async Task<IEnumerable<CustomerAddress>> GetCustomerAddressesAsync(int customerId)
        {
            using var connection = _context.CreatesqlConnection();
            {
                return await connection.QueryAsync<CustomerAddress>(
                    "GetCustomerAddresses",
                    new { CustomerID = customerId },
                    commandType: CommandType.StoredProcedure
                );
            }
        }
        public async Task<int> AddCustomerAddressAsync(CustomerAddress address)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var result = await connection.QuerySingleAsync<int>(
                    "AddCustomerAddress",
                    new
                    {
                        address.CustomerID,
                        address.AddressLine1,
                        address.AddressLine2,
                        address.City,
                        address.State,
                        address.Pincode,
                        address.Latitude,
                        address.Longitude,
                        address.CreatedBy
                    },
                    commandType: CommandType.StoredProcedure
                );

                return result;
            }
        }
        public async Task<IEnumerable<CustomerOrder>> GetOrdersByCustomerIdAsync(int customerId)
        {
            using var connection = _context.CreatesqlConnection();

            var lookup = new Dictionary<long, CustomerOrder>();

            await connection.QueryAsync<CustomerOrder, OrderItemDetails, CustomerOrder>(
                "GetOrdersByCustomerID",
                (order, item) =>
                {
                    if (!lookup.TryGetValue(order.OrderID, out var existingOrder))
                    {
                        existingOrder = order;
                        existingOrder.OrderItems = new List<OrderItemDetails>();
                        lookup.Add(existingOrder.OrderID, existingOrder);
                    }
                    existingOrder.OrderItems.Add(item);
                    return existingOrder;
                },
                new { CustomerID = customerId },
                commandType: CommandType.StoredProcedure,
                splitOn: "OrderItemID"
            );

            return lookup.Values.OrderByDescending(o => o.OrderDate);
        }

        public async Task<AdminDashboard> GetDashboardAsync()
        {
            using var connection = _context.CreatesqlConnection();
            {
                var result = await connection.QueryFirstOrDefaultAsync<AdminDashboard>(
                    "GetAdminDashboardStats",
                    commandType: CommandType.StoredProcedure);
                return result ?? new AdminDashboard();
            }
        }

        public async Task<IEnumerable<RecentOrder>> GetRecentOrdersAsync(int topN = 10)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var param = new { TopN = topN };
                return await connection.QueryAsync<RecentOrder>(
                    "GetAdminRecentOrders",
                    param,
                    commandType: CommandType.StoredProcedure);
            }
        }
        public async Task<IEnumerable<AdminOrderViewModel>> GetAllOrdersWithDetailsAsync()
        {
            using var connection = _context.CreatesqlConnection();
            var orders = await connection.QueryAsync<dynamic>(
                "GetAllOrdersWithDetails",
                commandType: CommandType.StoredProcedure
            );

            var result = new List<AdminOrderViewModel>();

            foreach (var item in orders)
            {
                var order = new AdminOrderViewModel
                {
                    OrderID = item.OrderID,
                    CustomerID = item.CustomerID,
                    CustomerName = item.CustomerName,
                    RestaurantID = item.RestaurantID,
                    RestaurantName = item.RestaurantName,
                    RiderID = item.RiderID,
                    RiderName = item.RiderName,
                    TotalAmount = item.TotalAmount,
                    PaymentStatus = item.PaymentStatus,
                    OrderStatus = item.OrderStatus,
                    DeliveryInstructions = item.DeliveryInstructions,
                    EstimatedDeliveryTime = item.EstimatedDeliveryTime,
                    CreatedAt = item.CreatedAt,
                    OrderItems = !string.IsNullOrEmpty(item.OrderItems)
                        ? JsonConvert.DeserializeObject<List<AdminOrderItemViewModel>>(item.OrderItems)
                        : new List<AdminOrderItemViewModel>()
                };
                result.Add(order);
            }

            return result;
        }
        public async Task<int> UpdateOrderStatusAsync(long orderId, string newStatus, string modifiedBy = null)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new
            {
                OrderID = orderId,
                Status = newStatus,
                ModifiedBy = modifiedBy
            };

            var query = @"
            UPDATE Orders 
            SET OrderStatus = @Status, 
                ModifiedBy = @ModifiedBy, 
                ModifiedAt = GETDATE()
            WHERE OrderID = @OrderID;
            SELECT @@ROWCOUNT;";

            var result = await connection.ExecuteScalarAsync<int>(query, parameters);
            return result;
        }
        public async Task<IEnumerable<RiderView>> GetAllRidersAsync()
        {
            using var connection = _context.CreatesqlConnection();
            {
                var riders = await connection.QueryAsync<RiderView>(
                    "GetAllRiders",
                    commandType: CommandType.StoredProcedure
                );
                return riders;
            }
        }

        public async Task<int> AssignRiderToOrderAsync(long orderId, int riderId, string modifiedBy)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var parameters = new DynamicParameters();
                parameters.Add("@OrderID", orderId);
                parameters.Add("@RiderID", riderId);
                parameters.Add("@ModifiedBy", modifiedBy);

                var result = await connection.ExecuteScalarAsync<int>(
                    "AssignRiderToOrder",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );
                return result;
            }
        }
        public async Task<RiderDashboard> GetRiderDashboardAsync(int riderId)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@RiderID", riderId, DbType.Int32);

            var dto = await connection.QueryFirstOrDefaultAsync<RiderDashboard>(
                "dbo.GetRiderDashboard",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return dto ?? new RiderDashboard();
        }
        public async Task<RiderStatusResponse> UpdateRiderStatusAsync(RiderStatusUpdate model)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@RiderID", model.RiderID, DbType.Int32);
            parameters.Add("@IsOnline", model.IsOnline, DbType.Boolean);

            var result = await connection.QueryFirstOrDefaultAsync<RiderStatusResponse>(
                "UpdateRiderStatus",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result ?? new RiderStatusResponse { Success = false, Message = "Failed to update status." };
        }
        public async Task<IEnumerable<RiderLiveOrder>> GetLiveOrdersForRiderAsync(int riderId)
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryAsync<RiderLiveOrder>(
                "GetLiveOrdersForRider",
                new { RiderID = riderId },
                commandType: CommandType.StoredProcedure
            );

            return result ?? Enumerable.Empty<RiderLiveOrder>();
        }
        public async Task<RiderOrderDetail> GetRiderOrderDetailsAsync(long orderId, int riderId)
        {
            using var connection = _context.CreatesqlConnection();
            using var multi = await connection.QueryMultipleAsync(
                "GetRiderOrderDetails",
                new { OrderID = orderId, RiderID = riderId },
                commandType: CommandType.StoredProcedure
            );

            var orderDetail = await multi.ReadFirstOrDefaultAsync<RiderOrderDetail>();
            if (orderDetail != null)
            {
                orderDetail.OrderItems = (await multi.ReadAsync<OrderItemDetail>()).ToList();
            }

            return orderDetail ?? new RiderOrderDetail();
        }
        public async Task<bool> UpdateOrderStatusByRiderAsync(long orderId, int riderId, string newStatus)
        {
            using var connection = _context.CreatesqlConnection();
            var result = await connection.ExecuteAsync(
                "UpdateOrderStatusByRider",
                new { OrderID = orderId, RiderID = riderId, NewStatus = newStatus },
                commandType: CommandType.StoredProcedure
            );
            return result != null;
        }
        public async Task<IEnumerable<RiderOrderHistory>> GetRiderOrderHistoryAsync(int riderId)
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryAsync<RiderOrderHistory>(
                "GetRiderOrderHistory",
                new { RiderID = riderId },
                commandType: CommandType.StoredProcedure
            );

            return result ?? Enumerable.Empty<RiderOrderHistory>();
        }
        public async Task<int> GetLiveOrderCountForRiderAsync(int riderId)
        {
            using var connection = _context.CreatesqlConnection();
            {
                var count = await connection.ExecuteScalarAsync<int>(
                    "GetLiveOrderCountForRider",
                    new { RiderID = riderId },
                    commandType: CommandType.StoredProcedure
                );
                return count;
            }
        }
        public async Task<(IEnumerable<RiderSummary> Riders, int TotalCount)> GetRidersAsync(string search, int page, int pageSize)
        {
            using var context = _context.CreatesqlConnection();
            {
                var result = await context.QueryMultipleAsync(
                    "GetRiders",
                    new
                    {
                        Search = search,
                        PageNumber = page,
                        PageSize = pageSize
                    },
                    commandType: CommandType.StoredProcedure
                );

                var riders = await result.ReadAsync<RiderSummary>();
                var total = await result.ReadFirstOrDefaultAsync<dynamic>();
                int totalCount = total?.TotalCount ?? 0;

                return (riders, totalCount);
            }
        }


        public async Task<bool> SetRiderIsActiveAsync(int riderId, bool isActive, string modifiedBy)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@RiderID", riderId);
            parameters.Add("@IsActive", isActive);
            parameters.Add("@ModifiedBy", string.IsNullOrEmpty(modifiedBy) ? null : modifiedBy);

            var affectedRows = await connection.ExecuteScalarAsync<int>(
                "SetRiderIsActive",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return affectedRows > 0;
        }
        public async Task<IEnumerable<PendingRider>> GetPendingRidersAsync()
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var riders = await connection.QueryAsync<PendingRider>(
                    "GetPendingRiders",
                    commandType: CommandType.StoredProcedure
                );
                return riders;
            }
        }

        public async Task<ApproveRiderResponse> ApproveRiderAsync(int riderId, string modifiedBy)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@RiderID", riderId);
                parameters.Add("@ModifiedBy", modifiedBy);

                var result = await connection.QueryFirstOrDefaultAsync<ApproveRiderResponse>(
                    "ApproveRider",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return result ?? new ApproveRiderResponse { Success = false, Message = "Error approving rider." };
            }
        }
        public async Task<IEnumerable<PendingRider>> GetPendingUserAsync()
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var riders = await connection.QueryAsync<PendingRider>(
                    "GetPendingRestaurants",
                    commandType: CommandType.StoredProcedure
                );
                return riders;
            }
        }

        public async Task<ApproveRiderResponse> ApproveUserAsync(int riderId, string modifiedBy)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@UserID", riderId);
                parameters.Add("@ModifiedBy", modifiedBy);

                var result = await connection.QueryFirstOrDefaultAsync<ApproveRiderResponse>(
                    "ApproveRestaurant",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return result ?? new ApproveRiderResponse { Success = false, Message = "Error approving rider." };
            }
        }
        public async Task<RestaurantDashboard?> GetRestaurantDashboardAsync(int restaurantId)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var result = await connection.QueryFirstOrDefaultAsync<RestaurantDashboard>(
                    "GetRestaurantDashboard",
                    new { RestaurantID = restaurantId },
                    commandType: CommandType.StoredProcedure
                );
                return result;
            }
        }
        public async Task<Restaurant?> GetRestaurantByUserAsync(int userId)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                const string query = @"
            SELECT TOP 1 
                r.RestaurantID,
                r.Name
            FROM Restaurants r
            INNER JOIN Users u ON r.UserID = u.UserID
            WHERE u.UserID = @UserID;
        ";

                var parameters = new { UserID = userId };

                var restaurant = await connection.QueryFirstOrDefaultAsync<Restaurant>(
                    query,
                    parameters,
                    commandType: CommandType.Text
                );

                return restaurant;
            }
        }

        public async Task<RestaurantUser?> GetRestaurantByOwnerAsync(int userId)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                return await connection.QueryFirstOrDefaultAsync<RestaurantUser>(
                    "GetRestaurantByUser",
                    new { UserID = userId },
                    commandType: CommandType.StoredProcedure
                );
            }
        }

        public async Task<int> AddRestaurantAsync(RestaurantUser restaurant)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new
                {
                    restaurant.UserID,
                    restaurant.Name,
                    restaurant.Description,
                    restaurant.Address,
                    restaurant.City,
                    restaurant.State,
                    restaurant.Pincode,
                    restaurant.Latitude,
                    restaurant.Longitude,
                    restaurant.OpeningTime,
                    restaurant.ClosingTime,
                    restaurant.ImageUrl,
                    CreatedBy = "System"
                };

                var result = await connection.QueryFirstOrDefaultAsync<dynamic>(
                    "AddRestaurant",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return Convert.ToInt32(result?.NewRestaurantID ?? 0);
            }
        }

        public async Task<bool> UpdateRestaurantAsync(RestaurantUser restaurant)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new
                {
                    restaurant.RestaurantID,
                    restaurant.Name,
                    restaurant.Description,
                    restaurant.Address,
                    restaurant.City,
                    restaurant.State,
                    restaurant.Pincode,
                    restaurant.OpeningTime,
                    restaurant.ClosingTime,
                    restaurant.IsOpen,
                    restaurant.ImageUrl,
                    ModifiedBy = "System"
                };

                try
                {
                    await connection.ExecuteAsync(
                        "UpdateRestaurant",
                        parameters,
                        commandType: CommandType.StoredProcedure
                    );
                    return true;
                }
                catch
                {
                    return false;
                }
            }
        }
        public async Task<bool> ToggleRestaurantOpenAsync(int restaurantId, bool isOpen)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("RestaurantID", restaurantId);
                parameters.Add("IsOpen", isOpen ? 1 : 0);

                var rows = await connection.ExecuteAsync(
                    "ToggleRestaurantOpen",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return rows > 0;
            }
        }
        public async Task<bool> UpdateMenuItem(MenuItem item)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@MenuItemID", item.MenuItemID);
                parameters.Add("@RestaurantID", item.RestaurantID);
                parameters.Add("@Name", item.Name);
                parameters.Add("@Description", item.Description);
                parameters.Add("@Category", item.Category);
                parameters.Add("@Price", item.Price);
                parameters.Add("@ImageUrl", item.ImageUrl);
                parameters.Add("@IsAvailable", item.IsAvailable);
                parameters.Add("@IsActive", item.IsActive);
                parameters.Add("@ModifiedBy", item.ModifiedBy);

                var rowsAffected = await connection.ExecuteAsync(
                    "UpdateMenuItem",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return rowsAffected > 0;
            }
        }
        public async Task<MenuItem?> GetMenuItemById(int menuItemId)
        {
            using (var connection = _context.CreatesqlConnection())
            {
                var parameters = new DynamicParameters();
                parameters.Add("@MenuItemID", menuItemId);

                var item = await connection.QueryFirstOrDefaultAsync<MenuItem>(
                    "GetMenuItemById",
                    parameters,
                    commandType: CommandType.StoredProcedure
                );

                return item;
            }
        }
        public async Task<bool> AddMenuItemAsync(MenuItemAdd item)
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.ExecuteScalarAsync<int>(
                "AddMenuItem",
                new
                {
                    item.RestaurantID,
                    item.Name,
                    item.Description,
                    item.Category,
                    item.Price,
                    item.ImageUrl,
                    item.IsAvailable,
                    item.CreatedBy,
                    item.IsActive
                },
                commandType: CommandType.StoredProcedure
            );

            return result > 0;
        }
        public async Task<IEnumerable<LiveOrder>> GetLiveOrdersForRestaurantAsync(int restaurantId)
        {
            using var connection = _context.CreatesqlConnection();

            var orderDictionary = new Dictionary<long, LiveOrder>();

            var result = await connection.QueryAsync<LiveOrder, LiveOrderItem, LiveOrder>(
                "GetLiveOrdersForRestaurant",
                (order, item) =>
                {
                    if (!orderDictionary.TryGetValue(order.OrderID, out var existingOrder))
                    {
                        existingOrder = order;
                        existingOrder.Items = new List<LiveOrderItem>();
                        orderDictionary.Add(existingOrder.OrderID, existingOrder);
                    }

                    existingOrder.Items.Add(item);
                    return existingOrder;
                },
                new { RestaurantID = restaurantId },
                splitOn: "MenuItemID",
                commandType: CommandType.StoredProcedure
            );

            return orderDictionary.Values.Any()
                ? orderDictionary.Values
                : Enumerable.Empty<LiveOrder>();
        }
        public async Task<(bool Success, string Message)> UpdateOrderStatusAsync(RestaurantOrderStatus model)
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryFirstOrDefaultAsync<dynamic>(
                "UpdateOrderStatus",
                new
                {
                    model.OrderID,
                    model.OrderStatus,
                    model.ModifiedBy
                },
                commandType: CommandType.StoredProcedure
            );

            if (result == null)
                return (false, "Unexpected error occurred.");

            return (Convert.ToBoolean(result.Success), (string)result.Message);
        }
        public async Task<IEnumerable<RestaurantOrderHistory>> GetRestaurantOrderHistoryAsync(int restaurantId)
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryAsync<RestaurantOrderHistory>(
                "GetRestaurantOrderHistory",
                new { RestaurantID = restaurantId },
                commandType: CommandType.StoredProcedure
            );
            return result;
        }
        public async Task<IEnumerable<MenuItemWithRestaurant>> GetAllMenuItemsWithRestaurantAsync()
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryAsync<MenuItemWithRestaurant>(
                "GetAllMenuItems",
                commandType: CommandType.StoredProcedure
            );

            return result;
        }
        public async Task<LiveOrderCount> GetActiveOrdersCountAsync()
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryFirstOrDefaultAsync<LiveOrderCount>(
                "GetActiveOrdersCount",
                commandType: CommandType.StoredProcedure
            );
            return result ?? new LiveOrderCount { ActiveOrdersCount = 0 };
        }
        public async Task<LiveOrderCount> GetRestaurantActiveOrdersCountAsync(int restaurantId)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@RestaurantID", restaurantId);

            var result = await connection.QueryFirstOrDefaultAsync<LiveOrderCount>(
                "GetRestaurantActiveOrdersCount",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result ?? new LiveOrderCount { ActiveOrdersCount = 0 };
        }
        public async Task<IEnumerable<Category>> GetDistinctCategoriesAsync()
        {
            using var connection = _context.CreatesqlConnection();

            var result = await connection.QueryAsync<Category>(
                "GetCategories",
                commandType: CommandType.StoredProcedure
            );

            return result;
        }
        public async Task<bool> UpdateUserProfileImageAsync(long userId, string profileImagePath)
        {
            using var connection = _context.CreatesqlConnection();
            await connection.ExecuteAsync(
                "UpdateUserProfileImage",
                new
                {
                    UserID = userId,
                    ProfileImagePath = profileImagePath
                },
                commandType: CommandType.StoredProcedure);

            return true;
        }
        // ================== Email / OTP ==================
        public async Task<OtpResponse> SaveEmailOtpAsync(string email, string otpCode, DateTime expiresAt)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Email", email);
            parameters.Add("@OtpCode", otpCode);
            parameters.Add("@ExpiresAt", expiresAt);

            var result = await connection.QueryFirstOrDefaultAsync<OtpResponse>(
                "SaveEmailOtp",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result ?? new OtpResponse
            {
                Success = false,
                Message = "Unknown error while generating OTP."
            };
        }

        public async Task<OtpResponse> VerifyEmailOtpAsync(string email, string otpCode)
        {
            using var connection = _context.CreatesqlConnection();

            var parameters = new DynamicParameters();
            parameters.Add("@Email", email);
            parameters.Add("@OtpCode", otpCode);

            var result = await connection.QueryFirstOrDefaultAsync<OtpResponse>(
                "VerifyEmailOtp",
                parameters,
                commandType: CommandType.StoredProcedure
            );

            return result ?? new OtpResponse
            {
                Success = false,
                Message = "Unknown error while verifying OTP."
            };
        }
    }
}






