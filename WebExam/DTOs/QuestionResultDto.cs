namespace WebExam.DTOs
{
    public class QuestionResultDto
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public int PointsEarned { get; set; }
        public int MaxPoints { get; set; }
        public string UserAnswer { get; set; }
        public List<string> CorrectAnswers { get; set; }
        public bool IsCorrect { get; set; }
    }
}
