namespace WebExam.Models
{
    public class ExamResult : BaseEntity
    {
        public int ExamSessionId { get; set; }
        public int TotalScore { get; set; }
        public int MaxPossibleScore { get; set; }
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public DateTime CalculatedAt { get; set; }
        public string Feedback { get; set; }

        // Навигационные свойства
        public virtual ExamSession ExamSession { get; set; }
    }
}
