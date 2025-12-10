using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface IExamSessionRepository : IRepository<ExamSession>
    {
        Task<ExamSession?> GetActiveSessionAsync(int userId, int examId);
        Task<ExamSession?> GetSessionWithDetailsAsync(int sessionId);
        Task<IEnumerable<ExamSession>> GetUserSessionsAsync(int userId);
        Task<bool> HasActiveSessionAsync(int userId);
        Task EndExpiredSessionsAsync();
        Task<IEnumerable<ExamSession>> GetExamSessionsAsync(int examId);
        Task<int> GetUserAttemptCountAsync(int userId, int examId);
        Task<bool> HasActiveSessionForExamAsync(int userId, int examId);
    }
}
