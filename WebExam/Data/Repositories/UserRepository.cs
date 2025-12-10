using Microsoft.EntityFrameworkCore;
using WebExam.Data;
using WebExam.Data.Interfaces;
using WebExam.Models;

namespace WebExam.Data.Repositories
{
    public class UserRepository : BaseRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context)
        {
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _dbSet
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByEmailWithDetailsAsync(string email)
        {
            return await _dbSet
                .Include(u => u.ExamSessions)
                .ThenInclude(es => es.Exam)
                .Include(u => u.ExamResults)
                .FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _dbSet.AnyAsync(u => u.Email == email);
        }

        public async Task<IEnumerable<User>> GetUsersByRoleAsync(UserRole role)
        {
            return await _dbSet
                .Where(u => u.Role == role && u.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetActiveUsersAsync()
        {
            return await _dbSet
                .Where(u => u.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<User>> GetUsersWithExamsAsync()
        {
            return await _dbSet
                .Include(u => u.ExamSessions)
                    .ThenInclude(es => es.Exam)
                .Where(u => u.IsActive)
                .ToListAsync();
        }
    }
}
