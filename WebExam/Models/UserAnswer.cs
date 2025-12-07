namespace WebExam.Models
{
    public class UserAnswer : BaseEntity
    {
        public int ExamSessionId { get; set; }
        public int QuestionId { get; set; }
        public string AnswerText { get; set; }
        public DateTime AnsweredAt { get; set; }

        // Для вариантов ответов
        public virtual ICollection<SelectedAnswerOption> SelectedOptions { get; set; }

        // Навигационные свойства
        public virtual ExamSession ExamSession { get; set; }
        public virtual Question Question { get; set; }
    }
}
