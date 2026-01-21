using FoodOrderDeliveryAPI.Models;
using FoodOrderDeliveryAPI.Repository;
using FoodOrderDeliveryAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace FoodOrderDeliveryAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUsersRepository _UsersRepository;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IWebHostEnvironment _env;
        private readonly IEmailService _emailService;
        private readonly IAIChatService _aiChatService;

        public UsersController(IUsersRepository UsersRepository, IJwtTokenService jwtTokenService, IWebHostEnvironment env, IEmailService emailService, IAIChatService aiChatService)
        {
            _UsersRepository = UsersRepository;
            _jwtTokenService = jwtTokenService;
            _env = env;
            _emailService = emailService;
            _aiChatService = aiChatService;
        }



        /// <summary>
        /// Gets all users.
        /// </summary>
        /// <returns>Returns a list of all users.</returns>
        [HttpGet("GetAllUsers")]
        [ProducesResponseType(typeof(IEnumerable<Users>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllUsers()
        {
            try
            {
                var users = await _UsersRepository.GetAllUsersAsync();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Gets a user by ID.
        /// </summary>
        /// <param name="id">The ID of the user to retrieve.</param>
        /// <returns>Returns the user object or 404 if not found.</returns>
        [AllowAnonymous]
        [HttpGet("GetUserByID/{id}")]
        [ProducesResponseType(typeof(Users), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetUserByID(int id)
        {
            try
            {
                var user = await _UsersRepository.GetUserByIdAsync(id);
                if (user == null)
                    return NotFound($"User with ID {id} not found.");

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Creates a new user.
        /// </summary>
        /// <param name="user">User object to create.</param>
        /// <returns>Returns the created user.</returns>
        [HttpPost("CreateUser")]
        [ProducesResponseType(typeof(Users), StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> CreateUser([FromBody] Users user)
        {
            try
            {
                if (user == null)
                    return BadRequest("User data is null.");

                var rowsAffected = await _UsersRepository.CreateUserAsync(user);

                if (rowsAffected > 0)
                    return CreatedAtAction(nameof(GetUserByID), new { id = user.UserID }, user);

                return BadRequest("User could not be created.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Updates an existing user.
        /// </summary>
        /// <param name="id">User ID.</param>
        /// <param name="user">Updated user data.</param>
        /// <returns>Status of the update.</returns>
        [HttpPut("UpdateUser/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] Users user)
        {
            try
            {
                if (user == null || id != user.UserID)
                    return BadRequest("User ID mismatch or invalid data.");

                var rowsAffected = await _UsersRepository.UpdateUserAsync(user);

                if (rowsAffected == 0)
                    return NotFound($"User with ID {id} not found.");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Updates password for an existing user.
        /// </summary>
        [HttpPost("ChangePassword")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var rowsAffected = await _UsersRepository.ChangeUserPasswordAsync(
                    request.UserID, request.OldPassword, request.NewPassword);

                if (rowsAffected == 0)
                    return BadRequest("Old password is incorrect or user not found.");

                return Ok(new { message = "Password changed successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Deletes a user by ID.
        /// </summary>
        /// <param name="id">The ID of the user to delete.</param>
        /// <returns>Status of the deletion.</returns>
        [HttpDelete("DeleteUser/{id}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> DeleteUser(int id)
        {
            try
            {
                var rowsAffected = await _UsersRepository.DeleteUserAsync(id);

                if (rowsAffected == 0)
                    return NotFound($"User with ID {id} not found.");

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Get user email and password for login.
        /// </summary>
        /// <param name="log"></param>
        /// <returns></returns>
        [AllowAnonymous]
        [HttpPost("login")]
        [ProducesResponseType(typeof(LoginRequest), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Login([FromBody] LoginRequest log)
        {
            try
            {
                var user = await _UsersRepository.AuthenticateUserAsync(log.Email);

                if (user == null)
                    return Ok(new { success = false, message = "User not registered." });

                // Password check (simple for now; use hashing later)
                if (user.Password != log.Password)
                    return Ok(new { success = false, message = "Invalid password." });

                // Account status check
                if (!user.IsActive)
                    return Ok(new { success = false, message = "Your account is pending for admin's approval." });

                // Generate JWT Token
                var token = _jwtTokenService.GenerateToken(user);

                return Ok(new
                {
                    success = true,
                    message = "Login successful",
                    token = token,
                    userID = user.UserID,
                    firstName = user.FirstName,
                    lastName = user.LastName,
                    email = user.Email,
                    phone = user.Phone,
                    roleName = user.RoleName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        /// <summary>
        /// Register a user
        /// </summary>
        /// <param name="user"></param>
        /// <returns>>200 if registered, 400 if not , 500 if failed.</returns>
        [AllowAnonymous]
        [HttpPost("register")]
        [ProducesResponseType(typeof(Users), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] Users user)
        {
            try
            {
                var result = await _UsersRepository.RegisterUserAsync(user);

                if (result == -1)
                {
                    return Ok(new { success = false, message = "Email already exists." });
                }

                // Auto-login: Generate JWT token
                var token = _jwtTokenService.GenerateToken(user);

                // ✅ Send registration success email
                await _emailService.SendRegistrationSuccessEmailAsync(
                    user.Email,
                    $"{user.FirstName} {user.LastName}",
                    (user.RoleName)
                );

                return Ok(new
                {
                    success = true,
                    message = "Registration successful.",
                    token = token,
                    userID = result,
                    user = user
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Retrieves all active restaurants.
        /// </summary>
        /// <returns>List of active restaurants.</returns>
        [HttpGet("restaurants")]
        [ProducesResponseType(typeof(IEnumerable<Restaurant>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllRestaurants()
        {
            try
            {
                var restaurants = await _UsersRepository.GetAllActiveRestaurantsAsync();

                if (restaurants == null || !restaurants.Any())
                    return NotFound("No active restaurants found.");

                return Ok(restaurants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Retrieves all menu items for a given restaurant.
        /// </summary>
        /// <returns>List of menu items for the specified restaurant.</returns>
        [HttpGet("menuitems/{restaurantId}")]
        [ProducesResponseType(typeof(IEnumerable<MenuItem>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetMenuItems(int restaurantId, [FromQuery] string role)
        {
            try
            {
                var items = await _UsersRepository.GetMenuItemsByRestaurantAsync(restaurantId, role);

                if (items == null || !items.Any())
                    return NotFound($"No menu items found for restaurant ID {restaurantId}.");

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Searches for restaurants or menu items based on a search term.
        /// </summary>
        /// <param name="term">The search keyword (restaurant name, menu item, or category).</param>
        /// <returns>List of search results including restaurants and menu items.</returns>
        [HttpGet("search")]
        [ProducesResponseType(typeof(IEnumerable<SearchResult>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Search([FromQuery] string term)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(term))
                    return BadRequest("Search term cannot be empty.");

                var result = await _UsersRepository.SearchAsync(term);

                if (result == null || !result.Any())
                    return NotFound($"No results found for '{term}'.");

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Retrieves all distinct food categories available across menu items.
        /// </summary>
        /// <returns>List of distinct category names.</returns>
        [HttpGet("categories")]
        [ProducesResponseType(typeof(IEnumerable<Category>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllCategories()
        {
            try
            {
                var categories = await _UsersRepository.GetAllCategoriesAsync();

                if (categories == null || !categories.Any())
                    return NotFound("No categories found.");

                return Ok(categories);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Retrieves all active restaurants.
        /// </summary>
        /// <returns>List of active restaurants.</returns>
        [HttpGet("by-category/{category}")]
        [ProducesResponseType(typeof(IEnumerable<Restaurant>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRestaurantsByCategory(string category)
        {
            try
            {
                var restaurants = await _UsersRepository.GetRestaurantsByCategoryAsync(category);

                if (restaurants == null || !restaurants.Any())
                    return NotFound("No active restaurants found.");

                return Ok(restaurants);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Add or update a cart item for a customer.
        /// </summary>
        /// <param name="cart">Cart item details</param>
        /// <returns>Returns success message or error status.</returns>
        [HttpPost("addcart")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddOrUpdateCart([FromBody] Cart cart)
        {
            try
            {
                var result = await _UsersRepository.AddOrUpdateCartItemAsync(cart);
                if (!result)
                    return BadRequest(new { success = false, message = "Failed to add/update cart item" });

                return Ok(new { success = true, message = "Item added/updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Get all cart items for a specific customer.
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>Returns a list of cart items.</returns>
        [HttpGet("cart/{customerId}")]
        [ProducesResponseType(typeof(IEnumerable<Cart>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetCartItems(int customerId)
        {
            try
            {
                var items = await _UsersRepository.GetCartItemsByCustomerAsync(customerId);

                if (items == null || !items.Any())
                    return NotFound(new { success = false, message = "No items found in cart" });

                return Ok(new { success = true, data = items });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Update the quantity of a specific cart item.
        /// </summary>
        /// <param name="cart">Cart object containing CartID and Quantity</param>
        /// <returns>Returns success or error response.</returns>
        [HttpPut("updatecart")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateQuantity([FromBody] Cart cart)
        {
            try
            {
                var result = await _UsersRepository.UpdateCartItemQuantityAsync(cart.CartID, cart.Quantity);

                if (!result)
                    return BadRequest(new { success = false, message = "Failed to update quantity" });

                return Ok(new { success = true, message = "Quantity updated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Remove a specific item from the cart.
        /// </summary>
        /// <param name="cartId">Cart item ID</param>
        /// <returns>Returns success message if deleted.</returns>
        [HttpDelete("removecart/{cartId}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> RemoveItem(long cartId)
        {
            try
            {
                var result = await _UsersRepository.RemoveCartItemAsync(cartId);

                if (!result)
                    return BadRequest(new { success = false, message = "Failed to remove item" });

                return Ok(new { success = true, message = "Item removed successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }

        /// <summary>
        /// Clear all cart items for a customer.
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>Returns success message if cleared.</returns>
        [HttpDelete("clearcart/{customerId}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ClearCart(int customerId)
        {
            try
            {
                var result = await _UsersRepository.ClearCartByCustomerAsync(customerId);

                if (!result)
                    return BadRequest(new { success = false, message = "Failed to clear cart" });

                return Ok(new { success = true, message = "Cart cleared successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error: {ex.Message}" });
            }
        }
        /// <summary>
        /// Get cart item count for a customer.
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>Returns success message if cleared.</returns>
        [HttpGet("count/{customerId}")]
        public async Task<IActionResult> GetCartItemCount(int customerId)
        {
            try
            {
                int count = await _UsersRepository.GetCartItemCountAsync(customerId);
                return Ok(new { totalQuantity = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving cart count: {ex.Message}");
            }
        }
        /// <summary>
        /// Place a new order for a specific customer.
        /// </summary>
        /// <param> </param>
        /// <returns>Returns a success message after placing order.</returns>
        [HttpPost("place-order")]
        [ProducesResponseType(typeof(OrderTransactionModel), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> PlaceOrder([FromBody] OrderTransactionModel request)

        {
            if (request == null || request.Order == null || request.OrderItems == null || request.Payment == null)
                return BadRequest(new { success = false, message = "Invalid request data." });

            try
            {
                // Step 1: Save main order
                var orderId = await _UsersRepository.SaveOrderAsync(request.Order);
                if (orderId == null || orderId <= 0)
                    return BadRequest(new { success = false, message = "Failed to save order." });

                // Step 2: Save order items
                foreach (var item in request.OrderItems)
                    item.OrderID = orderId.Value; // link OrderID to each item

                var itemsResult = await _UsersRepository.SaveOrderItemsAsync(request.OrderItems);
                if (itemsResult != "Success")
                    return BadRequest(new { success = false, message = "Failed to save order items." });

                // Step 3: Save payment
                request.Payment.OrderID = orderId.Value;
                var paymentResult = await _UsersRepository.SavePaymentAsync(request.Payment);
                if (paymentResult != "Success")
                    return BadRequest(new { success = false, message = "Payment failed." });

                return Ok(new
                {
                    success = true,
                    message = "Order placed successfully!",
                    orderId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Get all saved addresses for a specific customer.
        /// </summary>
        /// <param name="customerId">Customer ID</param>
        /// <returns>Returns a list of customer addresses.</returns>
        [HttpGet("getaddress{customerId}")]
        [ProducesResponseType(typeof(IEnumerable<CustomerAddress>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAddresses(int customerId)
        {
            try
            {
                var addresses = await _UsersRepository.GetCustomerAddressesAsync(customerId);

                if (addresses == null || !addresses.Any())
                    return NotFound(new { success = false, message = "No address found for this customer." });

                return Ok(new { success = true, data = addresses });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error retrieving addresses: {ex.Message}" });
            }
        }
        /// <summary>
        /// Add a new address for a specific customer.
        /// </summary>
        /// <param name="address">Customer address object containing details.</param>
        /// <returns>Returns a success message and the new Address ID.</returns>
        [HttpPost("addaddress")]
        [ProducesResponseType(typeof(CustomerAddress), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddAddress([FromBody] CustomerAddress address)
        {
            try
            {
                if (address == null)
                    return BadRequest(new { success = false, message = "Invalid address data." });

                var newId = await _UsersRepository.AddCustomerAddressAsync(address);
                return Ok(new
                {
                    success = true,
                    message = "Address added successfully.",
                    addressId = newId
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Error adding address: {ex.Message}" });
            }
        }
        /// <summary>
        /// Get all orders by customer.
        /// </summary>
        /// <param>name="customerId>Customer ID object containing details.  </param>
        /// <returns>Returns a success message .</returns>
        [AllowAnonymous]
        [HttpGet("orders/{customerId}")]
        [ProducesResponseType(typeof(CustomerOrder), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetOrdersByCustomerId(int customerId)
        {
            try
            {
                var orders = await _UsersRepository.GetOrdersByCustomerIdAsync(customerId);

                if (orders == null || !orders.Any())
                    return NotFound(new { message = "No orders found for this customer." });

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error fetching orders.", error = ex.Message });
            }
        }


        /// <summary>
        /// Retrieves summarized statistics for the admin dashboard.
        /// </summary>
        /// <returns>Dashboard stats including total orders, today's orders, total earnings, etc.</returns>
        [HttpGet("dashboardstats")]
        [ProducesResponseType(typeof(AdminDashboard), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {

                var stats = await _UsersRepository.GetDashboardAsync();

                if (stats == null)
                    return NotFound("No dashboard data found.");

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves a list of recent orders for the admin dashboard.
        /// </summary>
        /// <param name="topN">Number of recent orders to fetch. Default is 10.</param>
        /// <returns>List of recent orders with key details.</returns>
        [HttpGet("recent-orders")]
        [ProducesResponseType(typeof(IEnumerable<RecentOrder>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRecentOrders([FromQuery] int topN = 10)
        {
            try
            {
                var recentOrders = await _UsersRepository.GetRecentOrdersAsync(topN);

                if (recentOrders == null || !recentOrders.Any())
                    return NotFound("No recent orders found.");

                return Ok(recentOrders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Retrieves all customer orders with details.
        /// </summary>
        /// <returns>List of all orders with customer, restaurant, and item details.</returns>
        [HttpGet("all-orders")]
        [ProducesResponseType(typeof(IEnumerable<AdminOrderViewModel>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllOrders()
        {
            try
            {
                var orders = await _UsersRepository.GetAllOrdersWithDetailsAsync();

                if (orders == null || !orders.Any())
                    return NotFound("No orders found.");

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates the order status for a specific order.
        /// </summary>
        /// <param name="orderId">The unique ID of the order to update.</param>
        /// <param name="newStatus">The new status (Placed, Accepted, Preparing, etc.).</param>
        /// <returns>Success or error message.</returns>
        [HttpPut("update-status/{orderId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateOrderStatus(long orderId, [FromBody] string newStatus)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(newStatus))
                    return BadRequest("Invalid order status.");

                var updated = await _UsersRepository.UpdateOrderStatusAsync(orderId, newStatus, "Admin");

                if (updated > 0)
                    return Ok(new { message = "Order status updated successfully." });
                else
                    return NotFound("Order not found.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Get all active riders (for admin assignment)
        /// </summary>
        [HttpGet("all-riders")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllRiders()
        {
            try
            {
                var riders = await _UsersRepository.GetAllRidersAsync();
                return Ok(riders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Assign a rider to a specific order.
        /// </summary>
        [HttpPut("assign-rider/{orderId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AssignRider(long orderId, [FromBody] int riderId)
        {
            try
            {
                if (riderId <= 0)
                    return BadRequest("Invalid Rider ID");

                var rows = await _UsersRepository.AssignRiderToOrderAsync(orderId, riderId, "Admin");
                if (rows > 0)
                    return Ok(new { message = "Rider assigned successfully" });
                else
                    return NotFound("Order not found");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
        /// <summary>
        /// Retrieves the Rider Data.
        /// </summary>
        /// <param name="riderId">Unique Rider ID</param>
        /// <returns>Dashboard summary for the specified rider.</returns>
        [HttpGet("dashboard/{riderId}")]
        [ProducesResponseType(typeof(RiderDashboard), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRiderDashboard(int riderId)
        {
            try
            {
                if (riderId <= 0)
                    return BadRequest(new { success = false, message = "Invalid Rider ID." });

                var dashboard = await _UsersRepository.GetRiderDashboardAsync(riderId);

                if (dashboard == null)
                    return NotFound(new { success = false, message = "No dashboard data found for this rider." });

                return Ok(new
                {
                    success = true,
                    message = "Rider dashboard data retrieved successfully.",
                    data = dashboard
                });
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { success = false, message = $"Internal server error: {ex.Message}" });
            }
        }
        /// <summary>
        /// Updates Rider Online/Offline status.
        /// </summary>
        /// <param name="model">Rider status update model with RiderID and IsActive flag.</param>
        /// <returns>Status message indicating success or failure.</returns>
        [AllowAnonymous]
        [HttpPut("update-online-status")]
        [ProducesResponseType(typeof(RiderStatusResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateRiderStatus([FromBody] RiderStatusUpdate model)
        {
            try
            {
                if (model == null || model.RiderID <= 0)
                    return BadRequest(new { success = false, message = "Invalid input data." });

                var result = await _UsersRepository.UpdateRiderStatusAsync(model);

                if (result.Success)
                    return Ok(new { success = true, message = result.Message });
                else
                    return BadRequest(new { success = false, message = result.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"Internal server error: {ex.Message}" });
            }
        }
        /// <summary>
        /// Get all live (active) orders assigned to a specific rider.
        /// </summary>
        /// <param name="riderId">Rider ID</param>
        /// <returns>Returns list of live orders not marked as Delivered or Cancelled.</returns>
        [HttpGet("rider-live-orders/{riderId}")]
        [ProducesResponseType(typeof(RiderLiveOrder), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetLiveOrdersForRiderAsync(int riderId)
        {
            try
            {
                var orders = await _UsersRepository.GetLiveOrdersForRiderAsync(riderId);

                if (orders == null || !orders.Any())
                    return NotFound(new { message = "No active orders found for this rider." });

                return Ok(orders);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving rider live orders: {ex.Message}");
            }
        }
        /// <summary>
        /// Get full order details for a specific order assigned to a rider.
        /// </summary>
        /// <param name="riderId">Rider ID</param>
        /// <param name="orderId">Order ID</param>
        /// <returns>Returns complete order, customer, restaurant, and payment details.</returns>
        [AllowAnonymous]
        [HttpGet("rider-order-details/{riderId}/{orderId}")]
        [ProducesResponseType(typeof(RiderOrderDetail), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRiderOrderDetails(int riderId, long orderId)
        {
            try
            {
                var orderDetail = await _UsersRepository.GetRiderOrderDetailsAsync(orderId, riderId);
                if (orderDetail == null || orderDetail.OrderID == 0)
                    return NotFound(new { message = "No order details found for this rider." });

                return Ok(orderDetail);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving order details", error = ex.Message });
            }
        }
        /// <summary>
        /// Update order status by rider (Accepted → Preparing → PickedUp → Reached → Delivered)
        /// </summary>
        /// <param name="orderUpdate">Order ID, Rider ID, and new status</param>
        /// <returns>Returns success message if updated</returns>
        [HttpPut("update-rider-order-status")]
        [ProducesResponseType(typeof(OrderStatusUpdate), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateOrderStatusByRider([FromBody] OrderStatusUpdate orderUpdate)
        {
            try
            {
                var updated = await _UsersRepository.UpdateOrderStatusByRiderAsync(orderUpdate.OrderID, orderUpdate.RiderID, orderUpdate.NewStatus);
                if (!updated)
                    return NotFound(new { message = "Failed to update order status. Please verify order and rider IDs." });

                return Ok(new { message = $"Order status updated to {orderUpdate.NewStatus}" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating order status", error = ex.Message });
            }
        }
        /// <summary>
        /// Get full order history for a specific rider.
        /// </summary>
        /// <param name="riderId">Rider ID</param>
        /// <returns>Returns complete order, customer, restaurant, and payment details.</returns>
        [HttpGet("order-history/{riderId}")]
        [ProducesResponseType(typeof(RiderOrderHistory), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRiderOrderHistory(int riderId)
        {
            try
            {
                var result = await _UsersRepository.GetRiderOrderHistoryAsync(riderId);

                if (result == null || !result.Any())
                    return NotFound(new { success = false, message = "No past orders found." });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching order history.", error = ex.Message });
            }
        }
        /// <summary>
        /// Get live (active) order count for a specific rider.
        /// </summary>
        /// <param name="riderId">Rider ID</param>
        /// <returns>Returns total count of active orders assigned to the rider.</returns>
        [HttpGet("rider-liveorder-count/{riderId}")]
        [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRiderLiveOrderCount(int riderId)
        {
            try
            {
                var count = await _UsersRepository.GetLiveOrderCountForRiderAsync(riderId);

                if (count == 0)
                    return Ok(new { success = true, liveOrderCount = 0, message = "No active orders found." });

                return Ok(new { success = true, liveOrderCount = count });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false,message = "Error retrieving live order count.",error = ex.Message});
            }
        }
        /// <summary>
        /// Get rider list with pagination and search filter.
        /// </summary>
        /// <returns>Returns rider summary list, 404 if not found, 500 if failed.</returns>
        [HttpPost("rider-list")]
        [ProducesResponseType(typeof(IEnumerable<RiderSummary>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRidersList([FromBody] SearchRequest request)
        {
            try
            {
                var (riders, totalCount) = await _UsersRepository.GetRidersAsync(request.Search, request.Page, request.PageSize);

                if (riders == null || !riders.Any())
                    return NotFound(new { success = false, message = "No riders found." });

                return Ok(new { success = true, data = riders, totalCount });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error retrieving rider data.", error = ex.Message });
            }
        }
        /// <summary>
        /// Update rider's active status (Activate / Deactivate).
        /// </summary>
        /// <param name="id">Rider ID</param>
        /// <param name="req">Request body with IsActive value.</param>
        /// <returns>Returns confirmation message after update.</returns>
        [HttpPut("update-rider-status/{id}/active")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SetActive(int id, [FromBody] SetActiveResponse req)
        {
            try
            {
                if (req == null)
                    return BadRequest(new { success = false, message = "Invalid request payload." });

                string modifiedBy = User?.Identity?.Name ?? "admin";

                var updated = await _UsersRepository.SetRiderIsActiveAsync(id, req.IsActive, modifiedBy);

                if (!updated)
                    return BadRequest(new { success = false, message = "Failed to update rider status." });

                return Ok(new
                { success = true, message = $"Rider {(req.IsActive ? "activated" : "deactivated")} successfully."});
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false, message = "Error updating rider status.", error = ex.Message});
            }
        }
        /// <summary>
        /// Get all pending riders (awaiting admin approval)
        /// </summary>
        [HttpGet("pending-riders")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPendingRiders()
        {
            try
            {
                var result = await _UsersRepository.GetPendingRidersAsync();
                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false,message = "Error retrieving pending riders.",error = ex.Message});
            }
        }

        /// <summary>
        /// Approve a pending rider (activate account)
        /// </summary>
        [HttpPut("approve-rider/{riderId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ApproveRider(int riderId)
        {
            try
            {
                string modifiedBy = User?.Identity?.Name ?? "admin";

                var response = await _UsersRepository.ApproveRiderAsync(riderId, modifiedBy);

                if (!response.Success)
                    return BadRequest(new { success = false, message = response.Message });

                return Ok(new { success = true, message = response.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false,message = "Error approving rider.", error = ex.Message});
            }
        }
        /// <summary>
        /// Get all pending Restaurant Users (awaiting admin approval)
        /// </summary>
        [HttpGet("pending-restaurants")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetPendingUsers()
        {
            try
            {
                var result = await _UsersRepository.GetPendingUserAsync();
                return Ok(new
                {
                    success = true,
                    data = result
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false, message = "Error retrieving pending riders.", error = ex.Message });
            }
        }

        /// <summary>
        /// Approve a pending user (activate account)
        /// </summary>
        [HttpPut("approve-user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ApproveUser(int userId)
        {
            try
            {
                string modifiedBy = User?.Identity?.Name ?? "admin";

                var response = await _UsersRepository.ApproveUserAsync(userId, modifiedBy);

                if (!response.Success)
                    return BadRequest(new { success = false, message = response.Message });

                return Ok(new { success = true, message = response.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false, message = "Error approving rider.", error = ex.Message });
            }
        }
        /// <summary>
        /// Retrieves the Restaurant Data.
        /// </summary>
        /// <param name="restaurantId">Unique restaurant ID</param>
        /// <returns>Dashboard summary for the specified restaurant.</returns>
        [HttpGet("restaurant-dashboard/{restaurantId}")]
        [ProducesResponseType(typeof(RestaurantDashboard), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetDashboard(int restaurantId)
        {
            try
            {
                var data = await _UsersRepository.GetRestaurantDashboardAsync(restaurantId);
                if (data == null)
                    return NotFound(new { success = false, message = "Restaurant not found" });

                return Ok(new { success = true, data });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Get restaurant details by the associated user ID
        /// </summary>
        /// <param name="userId">The UserID of the restaurant owner</param>
        /// <returns>Restaurant details for the given user</returns>
        [HttpGet("get-restaurant-by-user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRestaurantByUser(int userId)
        {
            try
            {
                var result = await _UsersRepository.GetRestaurantByUserAsync(userId);
                if (result == null)
                {
                    return NotFound(new
                    {
                        success = false,
                        message = "No restaurant found for the given user."
                    });
                }
                return Ok(new
                { success = true,data = result});
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                { success = false,message = "Error retrieving restaurant by user.",error = ex.Message
                });
            }
        }
        /// <summary>
        /// Get restaurant Id by the associated user ID
        /// </summary>
        /// <param name="userId">The UserID of the restaurant owner</param>
        /// <returns>Restaurant details for the given user</returns>
        [HttpGet("by-user/{userId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetByUser(int userId)
        {
            try
            {
                var result = await _UsersRepository.GetRestaurantByOwnerAsync(userId);
                if (result == null)
                    return NotFound(new { success = false, message = "No restaurant found." });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error fetching restaurant.", error = ex.Message });
            }
        }
        /// <summary>
        /// Add new restaurant
        /// </summary>
        /// <returns>Restaurant added successfully message for the added user</returns>
        [HttpPost("add-restaurant")]
        [ProducesResponseType(typeof(RestaurantUser), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddRestaurant([FromBody] RestaurantUser restaurant)
        {
            try
            {
                var newId = await _UsersRepository.AddRestaurantAsync(restaurant);
                return Ok(new { success = true, restaurantId = newId });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error adding restaurant.", error = ex.Message });
            }
        }
        /// <summary>
        /// Update restaurant details
        /// </summary>
        /// <returns>Restaurant updated successfully message for the added user</returns>       
        [HttpPatch("update-restaurant")]
        [ProducesResponseType(typeof(RestaurantUser), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateRestaurant([FromBody] RestaurantUser restaurant)
        {
            try
            {
                var success = await _UsersRepository.UpdateRestaurantAsync(restaurant);
                return Ok(new { success });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Error updating restaurant.", error = ex.Message });
            }
        }
        /// <summary>
        /// Update restaurant status (Open / Close).
        /// </summary>
        /// <returns>Returns confirmation message after update.</returns>
        [HttpPatch("toggle-open/{restaurantId}")]
        [ProducesResponseType(typeof(ToggleOpen), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> ToggleOpen(int restaurantId, [FromBody] ToggleOpen dto)
        {
            if (dto == null)
                return BadRequest(new { success = false, message = "Request body is required." });

            var success = await _UsersRepository.ToggleRestaurantOpenAsync(restaurantId, dto.IsOpen);

            if (!success)
                return Ok(new { success = false, message = "Failed to update restaurant status." });

            return Ok(new
            {
                success = true,
                message = dto.IsOpen ? "Restaurant is now OPEN." : "Restaurant is now CLOSED."
            });
        }
        /// <summary>
        /// Update menu-item details
        /// </summary>
        /// <returns>Menu-item updated successfully message for the added user</returns>     
        [HttpPut("update-item")]
        [ProducesResponseType(typeof(MenuItem), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateMenuItem([FromBody] MenuItem item)
        {
            if (item == null || item.MenuItemID <= 0)
                return BadRequest(new { success = false, message = "Invalid menu item data." });

            var success = await _UsersRepository.UpdateMenuItem(item);

            if (success)
                return Ok(new { success = true, message = "Menu item updated successfully." });
            else
                return StatusCode(500, new { success = false, message = "Failed to update menu item." });
        }
        /// <summary>
        /// Get menu-item for filling form.
        /// </summary>
        /// <returns>Returns menu-item list, 404 if not found, 500 if failed.</returns>
        [HttpGet("menu-item/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetMenuItemById(int id)
        {
            if (id <= 0)
                return BadRequest(new { success = false, message = "Invalid menu item ID." });

            var item = await _UsersRepository.GetMenuItemById(id);

            if (item == null)
                return NotFound(new { success = false, message = "Menu item not found." });

            return Ok(new { success = true, data = item });
        }
        /// <summary>
        /// Adds a new menu item for a restaurant.
        /// </summary>
        /// <param name="item">Menu item details.</param>
        /// <returns>Success message when menu item is added.</returns>
        [HttpPost("add-menu-item")]
        [ProducesResponseType(typeof(MenuItemAdd), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> AddMenuItem([FromBody] MenuItemAdd item)
        {
            if (item == null || string.IsNullOrEmpty(item.Name))
                return BadRequest(new { success = false, message = "Invalid menu item data." });

            var success = await _UsersRepository.AddMenuItemAsync(item);

            if (success)
                return Ok(new { success = true, message = "Menu item added successfully." });
            else
                return StatusCode(500, new { success = false, message = "Failed to add menu item." });
        }
        /// <summary>
        /// Get Live-Orders for restaurant owners.
        /// </summary>
        /// <returns>Returns live-orders list, 404 if not found, 500 if failed.</returns>
        [HttpGet("live-orders/{restaurantId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetLiveOrders(int restaurantId)
        {
            var orders = await _UsersRepository.GetLiveOrdersForRestaurantAsync(restaurantId);

            if (orders == null || !orders.Any())
                return NotFound(new { success = false, message = "No active orders found." });

            return Ok(new { success = true, data = orders });
        }
        /// <summary>
        /// Update order status.
        /// </summary>
        /// <returns>Status updated successfully message for the added user</returns>   
        [HttpPost("update-status")]
        [ProducesResponseType(typeof(RestaurantOrderStatus), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UpdateOrderStatus([FromBody] RestaurantOrderStatus model)
        {
            if (model == null || model.OrderID <= 0)
                return BadRequest(new { success = false, message = "Invalid data." });

            var (success, message) = await _UsersRepository.UpdateOrderStatusAsync(model);

            return Ok(new { success, message });
        }
        /// <summary>
        /// Get Order-History for restaurant owners.
        /// </summary>
        /// <returns>Returns all orders list, 404 if not found, 500 if failed.</returns>
        [HttpGet("restaurant-order-history/{restaurantId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRestaurantOrderHistory(int restaurantId)
        {
            try
            {
                var result = await _UsersRepository.GetRestaurantOrderHistoryAsync(restaurantId);
                if (result == null || !result.Any())
                    return NotFound(new { success = false, message = "No order history found." });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Get all active menu items with restaurant details for customers.
        /// </summary>
        /// <returns>Returns all available menu items with restaurant info, 404 if not found, 500 if failed.</returns>
        [HttpGet("all-menuitems")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetAllMenuItems()
        {
            try
            {
                var result = await _UsersRepository.GetAllMenuItemsWithRestaurantAsync();

                if (result == null || !result.Any())
                    return NotFound(new { success = false, message = "No menu items found." });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Get the count of all active (non-delivered and non-cancelled) orders.
        /// </summary>
        /// <returns>Returns the count of ongoing orders; 404 if none found; 500 if an error occurs.</returns>
        [HttpGet("active-orders-count-admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetActiveOrdersCount()
        {
            try
            {
                var result = await _UsersRepository.GetActiveOrdersCountAsync();

                if (result == null || result.ActiveOrdersCount == 0)
                    return NotFound(new { success = false, message = "No active orders found." });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Get the count of active (Accepted, Preparing, Ready) orders for a specific restaurant.
        /// </summary>
        /// <param name="restaurantId">The ID of the restaurant.</param>
        /// <returns>Returns the count of active orders for the restaurant; 404 if none found; 500 if failed.</returns>
        [HttpGet("active-orders-count/{restaurantId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetRestaurantActiveOrdersCount(int restaurantId)
        {
            try
            {
                var result = await _UsersRepository.GetRestaurantActiveOrdersCountAsync(restaurantId);

                if (result == null || result.ActiveOrdersCount == 0)
                    return NotFound(new { success = false, message = "No active orders found for this restaurant." });

                return Ok(new { success = true, data = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Get all categories image.
        /// </summary>
        /// <returns>Returns categories image ; 404 if none found; 500 if an error occurs.</returns>
        [HttpGet("categories-img")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> GetDistinctCategories()
        {
            try
            {
                var categories = await _UsersRepository.GetDistinctCategoriesAsync();
                if (categories == null || !categories.Any())
                    return NotFound(new { success = false, message = "No categories found." });

                return Ok(new { success = true, data = categories });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        /// <summary>
        /// Upload user profile picture (file only).
        /// </summary>
        [HttpPost("upload-profile-picture/{userId:long}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> UploadProfilePicture(long userId, IFormFile file)
        {
            try
            {
                if (file == null || file.Length == 0)
                    return BadRequest(new { success = false, message = "No file uploaded." });

                var allowedExt = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (!allowedExt.Contains(ext))
                    return BadRequest(new { success = false, message = "Unsupported file type." });

                // ✅ wwwroot/profile-pictures
                var uploadsFolder = Path.Combine(_env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot"), "profile-pictures");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{ext}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // This is what the frontend will use in <img [src]>
                var relativePath = $"/profile-pictures/{fileName}";

                await _UsersRepository.UpdateUserProfileImageAsync(userId, relativePath);

                return Ok(new
                {
                    success = true,
                    message = "Profile picture uploaded successfully.",
                    data = new { profileImagePath = relativePath }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Server error", error = ex.Message });
            }
        }

        // ================== Email OTP ==================

        /// <summary>
        /// Send OTP to the user's registered email for verification.
        /// </summary>
        /// <param name="request">Contains the user's email.</param>
        /// <returns>Success message if OTP is sent; 400 if invalid input or cooldown active; 500 if failed.</returns>
        [AllowAnonymous]
        [HttpPost("send-otp")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email))
                    return BadRequest(new { success = false, message = "Email is required." });

                var otpCode = new Random().Next(100000, 999999).ToString();
                var expiresAt = DateTime.UtcNow.AddMinutes(5); // SP uses GETUTCDATE()

                var result = await _UsersRepository.SaveEmailOtpAsync(request.Email, otpCode, expiresAt);

                if (!result.Success)
                    return BadRequest(new { success = false, message = result.Message });

                await _emailService.SendOtpEmailAsync(request.Email, otpCode, 5);

                return Ok(new { success = true, message = "OTP sent to your email." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
        /// <summary>
        /// Verify the OTP sent to the user's email address during registration.
        /// </summary>
        /// <param name="request">Contains Email and OTP Code.</param>
        /// <returns>Success if OTP matched; 400 if invalid OTP; 500 if failed.</returns>
        [AllowAnonymous]
        [HttpPost("verify-otp")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.OtpCode))
                    return BadRequest(new { success = false, message = "Email and OTP are required." });

                var result = await _UsersRepository.VerifyEmailOtpAsync(request.Email, request.OtpCode);

                if (!result.Success)
                    return BadRequest(new { success = false, message = result.Message });

                return Ok(new { success = true, message = "OTP verified successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("ask")]
        public async Task<IActionResult> Ask([FromBody] AIChatRequest request)
        {

            if (request == null || string.IsNullOrWhiteSpace(request.Message))
                return BadRequest("Message is required.");

            // ✅ Extract userId from JWT
            var userIdClaim = User.FindFirst("userId")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                return Unauthorized("Invalid token.");

            int userId = int.Parse(userIdClaim);

            var response = await _aiChatService.ProcessUserMessageAsync(userId, request.Message);

            return Ok(response);
        }
    }
}



