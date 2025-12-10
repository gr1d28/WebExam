using WebExam.Models;

namespace WebExam.DTOs.Responses
{
    public class UserResponse
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class AuthResponse
    {
        public UserResponse User { get; set; }
        public string Token { get; set; }
    }
}
