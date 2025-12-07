using WebExam.Models;

namespace WebExam.DTOs
{
    public class QuestionDto
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int Order { get; set; }
        public List<AnswerOptionDto> AnswerOptions { get; set; }
    }
}
