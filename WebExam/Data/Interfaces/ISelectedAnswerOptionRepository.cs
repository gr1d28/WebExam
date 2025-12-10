using WebExam.Models;

namespace WebExam.Data.Interfaces
{
    public interface ISelectedAnswerOptionRepository : IRepository<SelectedAnswerOption>
    {
        Task<IEnumerable<SelectedAnswerOption>> GetSelectedOptionsByUserAnswerAsync(int userAnswerId);
        Task<bool> IsOptionSelectedAsync(int userAnswerId, int answerOptionId);
        Task ClearSelectedOptionsAsync(int userAnswerId);
        Task AddSelectedOptionsAsync(int userAnswerId, IEnumerable<int> optionIds);
        Task UpdateSelectedOptionsAsync(int userAnswerId, IEnumerable<int> newOptionIds);
    }
}
