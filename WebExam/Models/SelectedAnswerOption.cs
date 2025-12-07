namespace WebExam.Models
{
    public class SelectedAnswerOption : BaseEntity
    {
        public int UserAnswerId { get; set; }
        public int AnswerOptionId { get; set; }

        // Навигационные свойства
        public virtual UserAnswer UserAnswer { get; set; }
        public virtual AnswerOption AnswerOption { get; set; }
    }
}
