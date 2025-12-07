namespace WebExam.Models
{
    public class AnswerOption : BaseEntity
    {
        public int QuestionId { get; set; }
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
        public int? Order { get; set; }

        // Навигационные свойства
        public virtual Question Question { get; set; }
    }
}
