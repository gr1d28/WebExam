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

    public class ExamAttemptsResponse
    {
        public int ResultId { get; set; }
        public int ExamSessionId { get; set; }
        public int UserId { get; set; }
        public string UserFullName { get; set; }
        public string UserEmail { get; set; }
        public double TotalScore { get; set; }
        public double MaxPossibleScore { get; set; }
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public DateTime CalculatedAt { get; set; }
        public string? Feedback { get; set; }
        public int AttemptNumber { get; set; }
    }
}
