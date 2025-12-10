using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class SelectedAnswerOptionRepository : BaseRepository<SelectedAnswerOption>, ISelectedAnswerOptionRepository
    {
        public SelectedAnswerOptionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<SelectedAnswerOption>> GetSelectedOptionsByUserAnswerAsync(int userAnswerId)
        {
            return await _dbSet
                .Include(sao => sao.AnswerOption)
                .Where(sao => sao.UserAnswerId == userAnswerId)
                .ToListAsync();
        }

        public async Task<bool> IsOptionSelectedAsync(int userAnswerId, int answerOptionId)
        {
            return await _dbSet
                .AnyAsync(sao =>
                    sao.UserAnswerId == userAnswerId &&
                    sao.AnswerOptionId == answerOptionId);
        }

        public async Task ClearSelectedOptionsAsync(int userAnswerId)
        {
            var selectedOptions = await _dbSet
                .Where(sao => sao.UserAnswerId == userAnswerId)
                .ToListAsync();

            if (selectedOptions.Any())
            {
                _dbSet.RemoveRange(selectedOptions);
                await _context.SaveChangesAsync();
            }
        }

        public async Task AddSelectedOptionsAsync(int userAnswerId, IEnumerable<int> optionIds)
        {
            var selectedOptions = optionIds.Select(optionId => new SelectedAnswerOption
            {
                UserAnswerId = userAnswerId,
                AnswerOptionId = optionId
            });

            await _dbSet.AddRangeAsync(selectedOptions);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateSelectedOptionsAsync(int userAnswerId, IEnumerable<int> newOptionIds)
        {
            await ClearSelectedOptionsAsync(userAnswerId);
            await AddSelectedOptionsAsync(userAnswerId, newOptionIds);
        }

        public async Task<IEnumerable<int>> GetSelectedOptionIdsAsync(int userAnswerId)
        {
            return await _dbSet
                .Where(sao => sao.UserAnswerId == userAnswerId)
                .Select(sao => sao.AnswerOptionId)
                .ToListAsync();
        }

        public async Task<bool> HasSelectedOptionsAsync(int userAnswerId)
        {
            return await _dbSet
                .AnyAsync(sao => sao.UserAnswerId == userAnswerId);
        }
    }
}
