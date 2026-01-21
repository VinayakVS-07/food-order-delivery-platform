namespace FoodOrderDeliveryAPI.Models
{
    public class Users
    {
        public int UserID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public int RoleID { get; set; }
        public string RoleName { get; set; } = string.Empty;
        public DateTime RegisteredDate { get; set; }
        public string? Status { get; set; }
        public string? CreatedBy { get; set; }
        public bool IsActive { get; set; }
        public string? ModifiedBy { get; set; }
         public string? ProfileImagePath { get; set; }

    }
}
