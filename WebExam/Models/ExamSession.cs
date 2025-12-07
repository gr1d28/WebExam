namespace WebExam.Models
{
    public class ExamSession : BaseEntity
    {
        public int UserId { get; set; }
        public int ExamId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public ExamSessionStatus Status { get; set; }
        public int CurrentQuestionIndex { get; set; }

        // Навигационные свойства
        public virtual User User { get; set; }
        public virtual Exam Exam { get; set; }
        public virtual ICollection<UserAnswer> UserAnswers { get; set; }
        public virtual ExamResult ExamResult { get; set; }
    }

    public enum ExamSessionStatus
    {
        InProgress = 1,
        Submitted = 2,
        Expired = 3,
        Terminated = 4
    }
}
