namespace WebExam.DTOs
{
    public class ExamFilterDto
    {
        public string SearchTerm { get; set; }
        public bool? IsPublished { get; set; }
        public int? CreatedByUserId { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
}
