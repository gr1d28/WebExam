using WebExam.DTOs.Requests;
using WebExam.DTOs.Responses;

namespace WebExam.Services.Interfaces
{
    public interface IExamTakingService
    {
        // Управление сессиями экзамена
        Task<ExamSessionResponse> StartExamAsync(int examId, int userId);
        Task<ExamSessionResponse> GetActiveSessionAsync(int examId, int userId);
        Task<ExamSessionResponse> GetSessionStatusAsync(int sessionId, int userId);

        // Работа с вопросами
        Task<QuestionResponse> GetNextQuestionAsync(int sessionId, int userId);
        Task<QuestionResponse> GetQuestionAsync(int sessionId, int questionId, int userId);
        Task SubmitAnswerAsync(int sessionId, SubmitAnswerRequest request, int userId);

        // Завершение экзамена
        Task<ExamResultResponse> SubmitExamAsync(int sessionId, int userId);

        // Валидация и утилиты
        Task<bool> ValidateSessionAccessAsync(int sessionId, int userId);
        Task EndExpiredSessionsAsync();

        // Продвинутые функции
        Task<bool> CanStartExamAsync(int examId, int userId);
        Task<int> GetRemainingAttemptsAsync(int examId, int userId);
        Task<IEnumerable<ExamSessionResponse>> GetUserSessionsAsync(int userId, int examId = 0);
    }
}
