namespace FoodOrderDeliveryAPI.Models
{
    public class LiveOrder
    {
        public long OrderID { get; set; }
        public string OrderStatus { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime OrderTime { get; set; }

        // Customer Info
        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }

        // Rider Info
        public string RiderName { get; set; }
        public string RiderPhone { get; set; }

        // Items
        public List<LiveOrderItem> Items { get; set; } = new();
    }
    public class LiveOrderItem
    {
        public int MenuItemID { get; set; }
        public string ItemName { get; set; }
        public string ItemImage { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
