namespace WebExam.Models
{
    public class Exam : BaseEntity
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public int PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int CreatedByUserId { get; set; }

        // Навигационные свойства
        public virtual User CreatedBy { get; set; }
        public virtual ICollection<Question> Questions { get; set; }
        public virtual ICollection<ExamSession> ExamSessions { get; set; }
    }
}
