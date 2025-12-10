using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface IExamResultRepository : IRepository<ExamResult>
    {
        Task<ExamResult?> GetResultBySessionAsync(int sessionId);
        Task<ExamResult?> GetResultWithDetailsAsync(int resultId);
        Task<IEnumerable<ExamResult>> GetUserResultsAsync(int userId);
        Task<IEnumerable<ExamResult>> GetExamResultsAsync(int examId);
        Task<ExamResult?> GetBestResultAsync(int userId, int examId);
        Task<double> GetAverageScoreAsync(int examId);
        Task<int> GetPassedCountAsync(int examId);
        Task<bool> HasPassedExamAsync(int userId, int examId);
    }
}
