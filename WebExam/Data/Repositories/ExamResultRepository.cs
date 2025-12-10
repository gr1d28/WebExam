using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class ExamResultRepository : BaseRepository<ExamResult>, IExamResultRepository
    {
        public ExamResultRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ExamResult?> GetResultBySessionAsync(int sessionId)
        {
            return await _dbSet
                .FirstOrDefaultAsync(er => er.ExamSessionId == sessionId);
        }

        public async Task<ExamResult?> GetResultWithDetailsAsync(int resultId)
        {
            return await _dbSet
                .Include(er => er.ExamSession)
                    .ThenInclude(es => es.Exam)
                .Include(er => er.ExamSession)
                    .ThenInclude(es => es.User)
                .Include(er => er.ExamSession)
                    .ThenInclude(es => es.UserAnswers)
                        .ThenInclude(ua => ua.Question)
                .FirstOrDefaultAsync(er => er.Id == resultId);
        }

        public async Task<IEnumerable<ExamResult>> GetUserResultsAsync(int userId)
        {
            return await _context.ExamResults
                .Include(er => er.ExamSession)
                    .ThenInclude(es => es.Exam)
                .Where(er => er.ExamSession.UserId == userId)
                .OrderByDescending(er => er.CalculatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamResult>> GetExamResultsAsync(int examId)
        {
            return await _context.ExamResults
                .Include(er => er.ExamSession)
                    .ThenInclude(es => es.User)
                .Where(er => er.ExamSession.ExamId == examId)
                .OrderByDescending(er => er.CalculatedAt)
                .ToListAsync();
        }

        public async Task<ExamResult?> GetBestResultAsync(int userId, int examId)
        {
            return await _context.ExamResults
                .Include(er => er.ExamSession)
                .Where(er =>
                    er.ExamSession.UserId == userId &&
                    er.ExamSession.ExamId == examId)
                .OrderByDescending(er => er.Percentage)
                .ThenByDescending(er => er.CalculatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<double> GetAverageScoreAsync(int examId)
        {
            var results = await _context.ExamResults
                .Where(er => er.ExamSession.ExamId == examId)
                .Select(er => er.Percentage)
                .ToListAsync();

            return results.Any() ? results.Average() : 0;
        }

        public async Task<int> GetPassedCountAsync(int examId)
        {
            return await _context.ExamResults
                .CountAsync(er =>
                    er.ExamSession.ExamId == examId &&
                    er.IsPassed);
        }

        public async Task<bool> HasPassedExamAsync(int userId, int examId)
        {
            return await _context.ExamResults
                .AnyAsync(er =>
                    er.ExamSession.UserId == userId &&
                    er.ExamSession.ExamId == examId &&
                    er.IsPassed);
        }

        public async Task<Dictionary<int, ExamResult?>> GetLatestResultsByExamAsync(int userId)
        {
            var results = await _context.ExamResults
                .Include(er => er.ExamSession)
                .Where(er => er.ExamSession.UserId == userId)
                .GroupBy(er => er.ExamSession.ExamId)
                .Select(g => g.OrderByDescending(er => er.CalculatedAt).FirstOrDefault())
                .ToListAsync();

            return results
                .Where(r => r != null)
                .ToDictionary(r => r!.ExamSession.ExamId, r => r);
        }

        public async Task<int> GetTotalAttemptsAsync(int examId)
        {
            return await _context.ExamResults
                .CountAsync(er => er.ExamSession.ExamId == examId);
        }
    }
}
