using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class ExamSessionRepository : BaseRepository<ExamSession>, IExamSessionRepository
    {
        public ExamSessionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<ExamSession?> GetSessionWithDetailsAsync(int sessionId)
        {
            return await _dbSet
                .Include(es => es.Exam)
                .Include(es => es.User)
                .Include(es => es.UserAnswers)
                    .ThenInclude(ua => ua.Question)
                .Include(es => es.ExamResult)
                .FirstOrDefaultAsync(es => es.Id == sessionId);
        }

        public async Task<ExamSession?> GetActiveSessionAsync(int userId, int examId)
        {
            return await _dbSet
                .Include(es => es.Exam)
                .Include(es => es.UserAnswers)
                .FirstOrDefaultAsync(es =>
                    es.UserId == userId &&
                    es.ExamId == examId &&
                    es.Status == ExamSessionStatus.InProgress);
        }

        public async Task<ExamSession?> GetSessionWithUserAnswersAsync(int sessionId)
        {
            return await _dbSet
                .Include(es => es.UserAnswers)
                    .ThenInclude(ua => ua.SelectedOptions)
                        .ThenInclude(sao => sao.AnswerOption)
                .FirstOrDefaultAsync(es => es.Id == sessionId);
        }

        public async Task<IEnumerable<ExamSession>> GetUserSessionsAsync(int userId)
        {
            return await _dbSet
                .Include(es => es.Exam)
                .Include(es => es.ExamResult)
                .Where(es => es.UserId == userId)
                .OrderByDescending(es => es.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamSession>> GetExamSessionsAsync(int examId)
        {
            return await _dbSet
                .Include(es => es.User)
                .Include(es => es.ExamResult)
                .Where(es => es.ExamId == examId)
                .OrderByDescending(es => es.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamSession>> GetActiveSessionsAsync()
        {
            return await _dbSet
                .Include(es => es.Exam)
                .Include(es => es.User)
                .Where(es => es.Status == ExamSessionStatus.InProgress)
                .ToListAsync();
        }

        public async Task<IEnumerable<ExamSession>> GetExpiredSessionsAsync()
        {
            var now = DateTime.UtcNow;

            return await _dbSet
                .Include(es => es.Exam)
                .Where(es => es.Status == ExamSessionStatus.InProgress &&
                           es.StartTime.AddMinutes(es.Exam.DurationMinutes) < now)
                .ToListAsync();
        }

        public async Task<bool> HasActiveSessionAsync(int userId)
        {
            return await _dbSet
                .AnyAsync(es =>
                    es.UserId == userId &&
                    es.Status == ExamSessionStatus.InProgress);
        }

        public async Task<bool> HasActiveSessionForExamAsync(int userId, int examId)
        {
            return await _dbSet
                .AnyAsync(es =>
                    es.UserId == userId &&
                    es.ExamId == examId &&
                    es.Status == ExamSessionStatus.InProgress);
        }

        public async Task<int> GetUserAttemptCountAsync(int userId, int examId)
        {
            return await _dbSet
                .CountAsync(es =>
                    es.UserId == userId &&
                    es.ExamId == examId);
        }

        public async Task EndSessionAsync(int sessionId)
        {
            var session = await GetByIdAsync(sessionId);
            if (session != null)
            {
                session.Status = ExamSessionStatus.Submitted;
                session.EndTime = DateTime.UtcNow;
                await UpdateAsync(session);
            }
        }

        public async Task EndExpiredSessionsAsync()
        {
            var expiredSessions = await GetExpiredSessionsAsync();

            foreach (var session in expiredSessions)
            {
                session.Status = ExamSessionStatus.Expired;
                session.EndTime = DateTime.UtcNow;
            }

            if (expiredSessions.Any())
            {
                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> IsSessionActiveAsync(int sessionId)
        {
            var session = await GetByIdAsync(sessionId);
            return session != null && session.Status == ExamSessionStatus.InProgress;
        }
    }
}
