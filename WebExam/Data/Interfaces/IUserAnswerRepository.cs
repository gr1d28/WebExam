using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface IUserAnswerRepository : IRepository<UserAnswer>
    {
        Task<UserAnswer?> GetUserAnswerWithDetailsAsync(int userAnswerId);
        Task<IEnumerable<UserAnswer>> GetAnswersBySessionAsync(int sessionId);
        Task<UserAnswer?> GetAnswerForQuestionAsync(int sessionId, int questionId);
        Task<bool> HasAnswerForQuestionAsync(int sessionId, int questionId);
        Task<IEnumerable<UserAnswer>> GetAnswersWithOptionsBySessionAsync(int sessionId);
        Task ClearAnswersForSessionAsync(int sessionId);
    }
}
