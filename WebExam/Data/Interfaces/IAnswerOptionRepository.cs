using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface IAnswerOptionRepository : IRepository<AnswerOption>
    {
        Task<IEnumerable<AnswerOption>> GetOptionsByQuestionAsync(int questionId);
        Task<IEnumerable<AnswerOption>> GetCorrectOptionsByQuestionAsync(int questionId);
        Task<bool> HasCorrectOptionsAsync(int questionId);
        Task<IEnumerable<AnswerOption>> GetAnswerOptionsByQuestionAsync(int questionId);
    }
}
