namespace WebExam.DTOs
{
    public class CreateAnswerOptionDto
    {
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
        public int? Order { get; set; }
    }
}
