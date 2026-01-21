namespace FoodOrderDeliveryAPI.Models
{
    public class OrderItemModel
    {
        public long OrderID { get; set; }
        public int MenuItemID { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
    }
}
