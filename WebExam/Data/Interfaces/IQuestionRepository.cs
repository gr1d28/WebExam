using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface IQuestionRepository : IRepository<Question>
    {
        Task<Question?> GetQuestionWithOptionsAsync(int questionId);
        Task<IEnumerable<Question>> GetQuestionsByExamAsync(int examId);
        Task<IEnumerable<Question>> GetQuestionsWithOptionsByExamAsync(int examId);
        Task<int> GetMaxQuestionOrderAsync(int examId);
        Task ReorderQuestionsAsync(int examId, List<int> questionIds);
    }
}
