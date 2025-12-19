using WebExam.DTOs.Responses;

namespace WebExam.Services.Interfaces
{
    public interface IResultService
    {
        Task<ExamResultResponse> GetResultBySessionAsync(int sessionId, int userId);
        Task<IEnumerable<UserExamResultResponse>> GetUserResultsAsync(int userId);
        Task<ExamStatisticsResponse> GetExamStatisticsAsync(int examId, int userId);
        Task<ExamResultDetailsResponse> GetResultDetailsAsync(int resultId, int userId);
        Task<IEnumerable<ExamAttemptsResponse>> GetExamAttemptsAsync(int examId, int userId);
    }
}
