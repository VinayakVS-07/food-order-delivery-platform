namespace FoodOrderDeliveryAPI.Models
{
    public class RestaurantOrderHistory
    {
        public long OrderID { get; set; }
        public string OrderStatus { get; set; }
        public DateTime OrderTime { get; set; }

        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }

        public string RiderName { get; set; }
        public string RiderPhone { get; set; }

        public int MenuItemID { get; set; }
        public string ItemName { get; set; }
        public string ItemImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public decimal TotalAmount { get; set; }
    }
}
