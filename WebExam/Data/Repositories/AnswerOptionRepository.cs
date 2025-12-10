using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class AnswerOptionRepository : BaseRepository<AnswerOption>, IAnswerOptionRepository
    {
        public AnswerOptionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<IEnumerable<AnswerOption>> GetOptionsByQuestionAsync(int questionId)
        {
            return await _dbSet
                .Where(ao => ao.QuestionId == questionId)
                .OrderBy(ao => ao.Order)
                .ToListAsync();
        }

        public async Task<IEnumerable<AnswerOption>> GetCorrectOptionsByQuestionAsync(int questionId)
        {
            return await _dbSet
                .Where(ao => ao.QuestionId == questionId && ao.IsCorrect)
                .OrderBy(ao => ao.Order)
                .ToListAsync();
        }

        public async Task<bool> HasCorrectOptionsAsync(int questionId)
        {
            return await _dbSet
                .AnyAsync(ao => ao.QuestionId == questionId && ao.IsCorrect);
        }

        public async Task<int> DeleteOptionsByQuestionAsync(int questionId)
        {
            var options = await _dbSet
                .Where(ao => ao.QuestionId == questionId)
                .ToListAsync();

            _dbSet.RemoveRange(options);
            return await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<AnswerOption>> GetOptionsForQuestionsAsync(IEnumerable<int> questionIds)
        {
            return await _dbSet
                .Where(ao => questionIds.Contains(ao.QuestionId))
                .OrderBy(ao => ao.QuestionId)
                .ThenBy(ao => ao.Order)
                .ToListAsync();
        }

        public async Task<bool> ValidateOptionsAsync(int questionId, IEnumerable<int> optionIds)
        {
            var validOptionIds = await _dbSet
                .Where(ao => ao.QuestionId == questionId)
                .Select(ao => ao.Id)
                .ToListAsync();

            return optionIds.All(id => validOptionIds.Contains(id));
        }
    }
}
