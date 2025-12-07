namespace WebExam.DTOs
{
    public class UserExamAttemptDto
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public DateTime AttemptDate { get; set; }
        public int Score { get; set; }
        public int MaxScore { get; set; }
        public bool IsPassed { get; set; }
        public int AttemptNumber { get; set; }
    }
}
