namespace FoodOrderDeliveryAPI.Models
{
    public class OrderTransactionModel
    {
        public OrderModel Order { get; set; }
        public List<OrderItemModel> OrderItems { get; set; }
        public PaymentModel Payment { get; set; }
    }
}
