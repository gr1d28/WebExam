namespace WebExam.DTOs.Requests
{
    public class SubmitAnswerRequest
    {
        public int QuestionId { get; set; }
        public List<int> SelectedOptionIds { get; set; } = new();
        public string AnswerText { get; set; }
    }

    public class StartExamRequest
    {
        public int ExamId { get; set; }
    }
}
