using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface IExamRepository : IRepository<Exam>
    {
        Task<IEnumerable<Exam>> GetPublishedExamsAsync();
        Task<IEnumerable<Exam>> GetExamsByCreatorAsync(int userId);
        Task<Exam?> GetExamWithQuestionsAsync(int examId);
        Task<bool> ExamHasActiveSessionsAsync(int examId);
        Task<Exam?> GetExamWithDetailsAsync(int examId);
        Task<int> GetExamQuestionCountAsync(int examId);
    }
}
