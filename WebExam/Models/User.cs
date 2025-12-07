namespace WebExam.Models
{
    public class User : BaseEntity
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string PasswordHash { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }

        // Навигационные свойства
        public virtual ICollection<ExamSession> ExamSessions { get; set; }
        public virtual ICollection<ExamResult> ExamResults { get; set; }
    }

    public enum UserRole
    {
        Student = 1,
        Teacher = 2,
        Admin = 3
    }
}
