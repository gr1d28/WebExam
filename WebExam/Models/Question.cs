namespace WebExam.Models
{
    public class Question : BaseEntity
    {
        public int ExamId { get; set; }
        public string Text { get; set; }
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int Order { get; set; }

        // Навигационные свойства
        public virtual Exam Exam { get; set; }
        public virtual ICollection<AnswerOption> AnswerOptions { get; set; }
    }

    public enum QuestionType
    {
        SingleChoice = 1,
        MultipleChoice = 2,
        TextAnswer = 3,
        CodeAnswer = 4
    }
}
