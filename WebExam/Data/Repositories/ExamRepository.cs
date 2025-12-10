using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class ExamRepository : BaseRepository<Exam>, IExamRepository
    {
        public ExamRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Exam?> GetExamWithQuestionsAsync(int examId)
        {
            return await _dbSet
                .Include(e => e.Questions)
                    .ThenInclude(q => q.AnswerOptions)
                .FirstOrDefaultAsync(e => e.Id == examId);
        }

        public async Task<Exam?> GetExamWithDetailsAsync(int examId)
        {
            return await _dbSet
                .Include(e => e.Questions)
                    .ThenInclude(q => q.AnswerOptions)
                .Include(e => e.CreatedBy)
                .Include(e => e.ExamSessions)
                .FirstOrDefaultAsync(e => e.Id == examId);
        }

        public async Task<IEnumerable<Exam>> GetPublishedExamsAsync()
        {
            return await _dbSet
                .Where(e => e.IsPublished)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Exam>> GetExamsByCreatorAsync(int userId)
        {
            return await _dbSet
                .Where(e => e.CreatedByUserId == userId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Exam>> GetExamsWithQuestionsAsync()
        {
            return await _dbSet
                .Include(e => e.Questions)
                .Where(e => e.IsPublished)
                .ToListAsync();
        }

        public async Task<bool> IsExamPublishedAsync(int examId)
        {
            return await _dbSet
                .AnyAsync(e => e.Id == examId && e.IsPublished);
        }

        public async Task<int> GetExamQuestionCountAsync(int examId)
        {
            return await _context.Questions
                .Where(q => q.ExamId == examId)
                .CountAsync();
        }

        public async Task<bool> ExamHasActiveSessionsAsync(int examId)
        {
            return await _context.ExamSessions
                .AnyAsync(es => es.ExamId == examId &&
                               es.Status == ExamSessionStatus.InProgress);
        }

        public async Task<IEnumerable<Exam>> SearchExamsAsync(string searchTerm, bool? isPublished = null)
        {
            var query = _dbSet.AsQueryable();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(e =>
                    e.Title.Contains(searchTerm) ||
                    e.Description.Contains(searchTerm));
            }

            if (isPublished.HasValue)
            {
                query = query.Where(e => e.IsPublished == isPublished.Value);
            }

            return await query
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
        }
    }
}
