namespace FoodOrderDeliveryAPI.Models
{
    public class PaymentModel
    {
        public long OrderID { get; set; }
        public int CustomerID { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public string? TransactionID { get; set; }
        public string? Provider { get; set; }
        public decimal Amount { get; set; }
    }
}
