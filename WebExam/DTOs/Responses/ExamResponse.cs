using WebExam.Models;

namespace WebExam.DTOs.Responses
{
    public class ExamResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public int PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsPublished { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int QuestionCount { get; set; }
        public UserResponse CreatedBy { get; set; }
    }

    public class ExamDetailsResponse : ExamResponse
    {
        public List<QuestionResponse> Questions { get; set; } = new();
    }

    public class QuestionResponse
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public QuestionType Type { get; set; }
        public int Points { get; set; }
        public int Order { get; set; }
        public List<AnswerOptionResponse> AnswerOptions { get; set; } = new();
    }

    public class AnswerOptionResponse
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public int? Order { get; set; }
        public bool? IsCorrect { get; set; }
        // Note: IsCorrect обычно не отправляется клиенту до окончания экзамена
    }
}
