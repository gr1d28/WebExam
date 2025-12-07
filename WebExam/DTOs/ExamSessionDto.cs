using WebExam.Models;

namespace WebExam.DTOs
{
    public class ExamSessionDto
    {
        public Guid SessionId { get; set; }
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public ExamSessionStatus Status { get; set; }
        public int CurrentQuestionIndex { get; set; }
        public int TimeRemainingSeconds { get; set; }
        public int TotalQuestions { get; set; }
        public QuestionDto CurrentQuestion { get; set; }
    }
}
