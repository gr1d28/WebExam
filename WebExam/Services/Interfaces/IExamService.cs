using WebExam.DTOs.Requests;
using WebExam.DTOs.Responses;

namespace WebExam.Services.Interfaces
{
    public interface IExamService
    {
        Task<ExamDetailsResponse> CreateExamAsync(CreateExamRequest request, int creatorId);
        Task<ExamDetailsResponse> UpdateExamAsync(int examId, UpdateExamRequest request, int userId);
        Task DeleteExamAsync(int examId, int userId);
        Task<ExamDetailsResponse> GetExamByIdAsync(int examId, int userId);
        Task<ExamDetailsResponse> GetExamForTakingAsync(int examId, int userId);
        Task<IEnumerable<ExamResponse>> GetPublishedExamsAsync();
        Task<IEnumerable<ExamResponse>> GetUserExamsAsync(int userId);
        Task PublishExamAsync(int examId, int userId);
        Task UnpublishExamAsync(int examId, int userId);
        Task<bool> ValidateExamAccessAsync(int examId, int userId);
    }
}
