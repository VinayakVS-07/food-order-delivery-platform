using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;


namespace FoodOrderDeliveryAPI.Data
{
    public class AppDbContext
    {

        private readonly IConfiguration _configuration;
        private readonly string? _connectionString;
        public AppDbContext(IConfiguration configuration)
        {
            _configuration = configuration;
            _connectionString = _configuration.GetConnectionString("DefaultConnection");
        }
        public IDbConnection CreatesqlConnection()
            => new SqlConnection(_connectionString);
    }
}
