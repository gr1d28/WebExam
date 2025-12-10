using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class QuestionRepository : BaseRepository<Question>, IQuestionRepository
    {
        public QuestionRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<Question?> GetQuestionWithOptionsAsync(int questionId)
        {
            return await _dbSet
                .Include(q => q.AnswerOptions)
                .Include(q => q.Exam)
                .FirstOrDefaultAsync(q => q.Id == questionId);
        }

        public async Task<IEnumerable<Question>> GetQuestionsByExamAsync(int examId)
        {
            return await _dbSet
                .Where(q => q.ExamId == examId)
                .OrderBy(q => q.Order)
                .ToListAsync();
        }

        public async Task<IEnumerable<Question>> GetQuestionsWithOptionsByExamAsync(int examId)
        {
            return await _dbSet
                .Include(q => q.AnswerOptions)
                .Where(q => q.ExamId == examId)
                .OrderBy(q => q.Order)
                .ToListAsync();
        }

        public async Task<int> GetMaxQuestionOrderAsync(int examId)
        {
            return await _dbSet
                .Where(q => q.ExamId == examId)
                .MaxAsync(q => (int?)q.Order) ?? 0;
        }

        public async Task ReorderQuestionsAsync(int examId, List<int> questionIds)
        {
            var questions = await _dbSet
                .Where(q => q.ExamId == examId)
                .ToListAsync();

            var questionDict = questions.ToDictionary(q => q.Id);

            for (int i = 0; i < questionIds.Count; i++)
            {
                if (questionDict.TryGetValue(questionIds[i], out var question))
                {
                    question.Order = i + 1;
                }
            }

            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Question>> GetQuestionsWithCorrectAnswersAsync(int examId)
        {
            return await _dbSet
                .Include(q => q.AnswerOptions.Where(ao => ao.IsCorrect))
                .Where(q => q.ExamId == examId)
                .ToListAsync();
        }
    }
}
