namespace WebExam.DTOs
{
    public class UpdateExamDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public int DurationMinutes { get; set; }
        public int PassingScore { get; set; }
        public int MaxAttempts { get; set; }
        public bool IsPublished { get; set; }
    }
}
