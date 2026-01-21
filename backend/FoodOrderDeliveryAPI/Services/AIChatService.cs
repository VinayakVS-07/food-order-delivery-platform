namespace FoodOrderDeliveryAPI.Services
{
    using System.Net.Http;
    using System.Text;
    using System.Text.Json;
    using System.Threading.Tasks;
    using FoodOrderDeliveryAPI.Models;
    using FoodOrderDeliveryAPI.Repository;
    using Microsoft.Extensions.Configuration;
    using FoodOrderDeliveryAPI.Enums;
    public class AIChatService : IAIChatService
    {
        private readonly IUsersRepository _UsersRepository;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public AIChatService(
             IUsersRepository usersRepository,
             HttpClient httpClient,
             IConfiguration configuration)
        {
            _UsersRepository = usersRepository;
            _httpClient = httpClient;
            _apiKey = configuration["Gemini:ApiKey"];
        }

        public async Task<AIChatResponse> ProcessUserMessageAsync(int userId, string message)
        {
            var intent = DetectIntent(message);

            string context = intent switch
            {
                AIIntent.TrackOrder => await BuildTrackOrderContext(userId),
                AIIntent.DelayReason => await BuildDelayContext(userId),
                AIIntent.CancelOrder => await BuildCancelContext(userId),
                AIIntent.SuggestFood => await BuildFoodSuggestionContext(),
                AIIntent.Unknown => BuildFoodConversationContext(),
                _ => "No relevant context available."
            };

            var prompt = BuildPrompt(context, message);
            var reply = await CallGeminiAsync(prompt);

            return new AIChatResponse
            {
                Reply = reply,
                IsActionable = intent == AIIntent.CancelOrder
            };
        }


        // ---------------- INTENT ----------------

        private AIIntent DetectIntent(string message)
        {
            message = message.ToLower();

            if (message.Contains("where") || message.Contains("track"))
                return AIIntent.TrackOrder;

            if (message.Contains("delay") || message.Contains("late"))
                return AIIntent.DelayReason;

            if (message.Contains("cancel"))
                return AIIntent.CancelOrder;

            if (message.Contains("suggest") || message.Contains("eat") ||
                message.Contains("food") || message.Contains("dinner") ||
                message.Contains("lunch") || message.Contains("breakfast"))
                return AIIntent.SuggestFood;

            // Everything else becomes conversational food assistant
            return AIIntent.Unknown;
        }

        // ---------------- CONTEXT BUILDERS ----------------

        private async Task<string> BuildTrackOrderContext(int userId)
        {
            var orders = await _UsersRepository.GetOrdersByCustomerIdAsync(userId);
            var activeOrder = orders
                .OrderByDescending(o => o.OrderDate)
                .FirstOrDefault(o => o.OrderStatus != "Failed");

            if (activeOrder == null)
                return "The customer has no active orders.";

            return $"""
        Order ID: {activeOrder.OrderID}
        Status: {activeOrder.OrderStatus}
        Restaurant: {activeOrder.RestaurantName}
        Total Amount: ₹{activeOrder.TotalAmount}
        """;
        }

        private async Task<string> BuildDelayContext(int userId)
        {
            var orders = await _UsersRepository.GetOrdersByCustomerIdAsync(userId);
            var activeOrder = orders
                .OrderByDescending(o => o.OrderDate)
                .FirstOrDefault(o => o.OrderStatus != "Failed");

            if (activeOrder == null)
                return "There is no active order to check delay.";

            return $"""
        Order Status: {activeOrder.OrderStatus}
        Restaurant: {activeOrder.RestaurantName}
        Delay Reason: Order is still being prepared or awaiting rider assignment.
        """;
        }

        private async Task<string> BuildCancelContext(int userId)
        {
            var orders = await _UsersRepository.GetOrdersByCustomerIdAsync(userId);
            var activeOrder = orders
                .OrderByDescending(o => o.OrderDate)
                .FirstOrDefault(o => o.OrderStatus == "Placed" || o.OrderStatus == "Preparing");

            if (activeOrder == null)
                return "No order is eligible for cancellation.";

            return $"""
        Order ID: {activeOrder.OrderID}
        Current Status: {activeOrder.OrderStatus}
        Cancellation Allowed: Yes (before pickup)
        Refund: Processed in 3–5 business days.
        """;
        }

        private async Task<string> BuildFoodSuggestionContext()
        {
            var items = await _UsersRepository.GetAllMenuItemsWithRestaurantAsync();

            if (!items.Any())
                return "There are no food items available right now.";

            var sb = new StringBuilder();
            sb.AppendLine("Popular and well-loved food options nearby:");

            foreach (var item in items.Take(10))
            {
                sb.AppendLine($"• {item.MenuItemName} ({item.RestaurantName}) – ₹{item.Price}");
            }

            sb.AppendLine("You can also ask for healthy, veg, or light food options.");

            return sb.ToString();
        }


        // ---------------- PROMPT ----------------

        private string BuildPrompt(string context, string userMessage)
        {
            return $"""
    You are a friendly AI food assistant for a food delivery app.

    Your personality:
    - Helpful, warm, and professional
    - Speaks like a food trainee or mentor
    - Short and clear responses (2–4 lines max)
    - Easy language, customer-friendly
    - No emojis overload (1 max if needed)

    Rules:
    - Use ONLY the provided context for order-related answers
    - Do NOT invent order details
    - For food advice, keep it practical and realistic
    - If unsure, politely guide the customer

    Context:
    {context}

    Customer Message:
    {userMessage}

    Respond now:
    """;
        }


        private string BuildFoodConversationContext()
        {
            return """
        You are chatting with a customer who wants food-related advice.
        The customer may ask about healthy food, diet, cravings, or meal ideas.
        Respond like a friendly food trainee or food coach.
        Keep answers short, practical, and encouraging.
        """;
        }


        // ---------------- GEMINI ----------------

        private async Task<string> CallGeminiAsync(string prompt)
        {
            var body = new
            {
                contents = new[]
                {
                new
                {
                    role = "user",
                    parts = new[] { new { text = prompt } }
                }
            }
            };

            var content = new StringContent(
                JsonSerializer.Serialize(body),
                Encoding.UTF8,
                "application/json");

            var response = await _httpClient.PostAsync(
                $"https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key={_apiKey}",
                content);

            response.EnsureSuccessStatusCode();

            var json = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(json);

            return doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString()
                ?? "Unable to generate response.";
        }
    }
}
