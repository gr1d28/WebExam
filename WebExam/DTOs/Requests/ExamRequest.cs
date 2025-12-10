using WebExam.Models;

namespace WebExam.DTOs.Requests
{
    public class CreateExamRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; } = 60;
        public int PassingScore { get; set; } = 60;
        public int MaxAttempts { get; set; } = 1;
        public bool IsPublished { get; set; } = false;
        public List<CreateQuestionRequest> Questions { get; set; } = new();
    }

    public class CreateQuestionRequest
    {
        public string Text { get; set; }
        public QuestionType Type { get; set; }
        public int Points { get; set; } = 1;
        public int Order { get; set; }
        public List<CreateAnswerOptionRequest> AnswerOptions { get; set; } = new();
    }

    public class CreateAnswerOptionRequest
    {
        public string Text { get; set; }
        public bool IsCorrect { get; set; }
        public int? Order { get; set; }
    }

    public class UpdateExamRequest
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public int PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsPublished { get; set; }
    }
}
