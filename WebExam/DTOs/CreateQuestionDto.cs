using WebExam.Models;

namespace WebExam.DTOs
{
    public class CreateQuestionDto
    {
        public string Text { get; set; }
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int Order { get; set; }
        public List<CreateAnswerOptionDto> AnswerOptions { get; set; }
    }
}
