using WebExam.Models;

namespace WebExam.DTOs.Responses
{
    public class ExamSessionResponse
    {
        public int Id { get; set; }
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public ExamSessionStatus Status { get; set; }
        public int CurrentQuestionIndex { get; set; }
        public int TotalQuestions { get; set; }
        public int TimeRemainingSeconds { get; set; }
        public bool IsExpired => Status == ExamSessionStatus.Expired;
        public bool IsSubmitted => Status == ExamSessionStatus.Submitted;
        public QuestionResponse CurrentQuestion { get; set; }
    }

    public class ExamResultResponse
    {
        public int Id { get; set; }
        public int ExamSessionId { get; set; }
        public int TotalScore { get; set; }
        public int MaxPossibleScore { get; set; }
        public double Percentage { get; set; }
        public bool IsPassed { get; set; }
        public DateTime CalculatedAt { get; set; }
        public string Feedback { get; set; }
        public ExamResponse Exam { get; set; }
    }

    public class ExamResultDetailsResponse : ExamResultResponse
    {
        public List<QuestionResultResponse> QuestionResults { get; set; } = new();
    }

    public class QuestionResultResponse
    {
        public int QuestionId { get; set; }
        public string QuestionText { get; set; }
        public QuestionType QuestionType { get; set; }
        public int PointsEarned { get; set; }
        public int MaxPoints { get; set; }
        public string UserAnswerText { get; set; }
        public List<SelectedOptionResponse> SelectedOptions { get; set; } = new();
        public List<CorrectOptionResponse> CorrectOptions { get; set; } = new();
        public bool IsCorrect { get; set; }
        public string Feedback { get; set; }
    }

    public class SelectedOptionResponse
    {
        public int Id { get; set; }
        public string Text { get; set; }
        public bool WasCorrect { get; set; }
    }

    public class CorrectOptionResponse
    {
        public int Id { get; set; }
        public string Text { get; set; }
    }

    public class UserExamResultResponse
    {
        public int ExamId { get; set; }
        public string ExamTitle { get; set; }
        public int BestScore { get; set; }
        public int MaxScore { get; set; }
        public double BestPercentage { get; set; }
        public bool HasPassed { get; set; }
        public int AttemptCount { get; set; }
        public DateTime LastAttemptDate { get; set; }
    }

    public class ExamStatisticsResponse
    {
        public int TotalAttempts { get; set; }
        public int PassedAttempts { get; set; }
        public double AverageScore { get; set; }
        public double PassRate { get; set; }
        public List<ScoreDistributionResponse> ScoreDistribution { get; set; } = new();
    }

    public class ScoreDistributionResponse
    {
        public string Range { get; set; }
        public int Count { get; set; }
    }
}
