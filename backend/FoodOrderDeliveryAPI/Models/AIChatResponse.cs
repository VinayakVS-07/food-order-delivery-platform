namespace FoodOrderDeliveryAPI.Models
{
    public class AIChatResponse
    {
        public string Reply { get; set; }
        public bool IsActionable { get; set; } // cancel, track, suggest
    }
}
