using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class UserAnswerRepository : BaseRepository<UserAnswer>, IUserAnswerRepository
    {
        public UserAnswerRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<UserAnswer?> GetUserAnswerWithDetailsAsync(int userAnswerId)
        {
            return await _dbSet
                .Include(ua => ua.SelectedOptions)
                    .ThenInclude(sao => sao.AnswerOption)
                .Include(ua => ua.Question)
                .Include(ua => ua.ExamSession)
                .FirstOrDefaultAsync(ua => ua.Id == userAnswerId);
        }

        public async Task<IEnumerable<UserAnswer>> GetAnswersBySessionAsync(int sessionId)
        {
            return await _dbSet
                .Include(ua => ua.Question)
                .Include(ua => ua.SelectedOptions)
                .Where(ua => ua.ExamSessionId == sessionId)
                .OrderBy(ua => ua.Question.Order)
                .ToListAsync();
        }

        public async Task<UserAnswer?> GetAnswerForQuestionAsync(int sessionId, int questionId)
        {
            return await _dbSet
                .Include(ua => ua.SelectedOptions)
                .FirstOrDefaultAsync(ua =>
                    ua.ExamSessionId == sessionId &&
                    ua.QuestionId == questionId);
        }

        public async Task<bool> HasAnswerForQuestionAsync(int sessionId, int questionId)
        {
            return await _dbSet
                .AnyAsync(ua =>
                    ua.ExamSessionId == sessionId &&
                    ua.QuestionId == questionId);
        }

        public async Task<IEnumerable<UserAnswer>> GetAnswersWithOptionsBySessionAsync(int sessionId)
        {
            return await _dbSet
                .Include(ua => ua.SelectedOptions)
                    .ThenInclude(sao => sao.AnswerOption)
                .Include(ua => ua.Question)
                .Where(ua => ua.ExamSessionId == sessionId)
                .ToListAsync();
        }

        public async Task ClearAnswersForSessionAsync(int sessionId)
        {
            var answers = await _dbSet
                .Where(ua => ua.ExamSessionId == sessionId)
                .ToListAsync();

            if (answers.Any())
            {
                _dbSet.RemoveRange(answers);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<Dictionary<int, UserAnswer>> GetAnswersDictionaryBySessionAsync(int sessionId)
        {
            var answers = await GetAnswersBySessionAsync(sessionId);
            return answers.ToDictionary(a => a.QuestionId);
        }

        public async Task<int> GetAnsweredQuestionsCountAsync(int sessionId)
        {
            return await _dbSet
                .CountAsync(ua => ua.ExamSessionId == sessionId);
        }
    }
}
