using Microsoft.EntityFrameworkCore;
using System.Reflection;
using WebExam.Data.Configurations;
using WebExam.Models;


namespace WebExam.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Exam> Exams { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<AnswerOption> AnswerOptions { get; set; }
        public DbSet<ExamSession> ExamSessions { get; set; }
        public DbSet<UserAnswer> UserAnswers { get; set; }
        public DbSet<SelectedAnswerOption> SelectedAnswerOptions { get; set; }
        public DbSet<ExamResult> ExamResults { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Применяем все конфигурации из сборки
            modelBuilder.ApplyConfigurationsFromAssembly(Assembly.GetExecutingAssembly());

            // Настраиваем поведение удаления для всех связей
            foreach (var relationship in modelBuilder.Model.GetEntityTypes()
                .SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.Restrict;
            }

            modelBuilder.ApplyConfiguration(new ExamConfiguration());
            modelBuilder.ApplyConfiguration(new QuestionConfiguration());
            modelBuilder.ApplyConfiguration(new AnswerOptionConfiguration());
            modelBuilder.ApplyConfiguration(new ExamSessionConfiguration());
            modelBuilder.ApplyConfiguration(new UserAnswerConfiguration());
            modelBuilder.ApplyConfiguration(new SelectedAnswerOptionConfiguration());
            modelBuilder.ApplyConfiguration(new ExamResultConfiguration());
            modelBuilder.ApplyConfiguration(new UserConfiguration());

            // Глобальные фильры (например, для soft delete)
            // modelBuilder.Entity<User>().HasQueryFilter(u => u.IsActive);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            // Автоматическое заполнение дат
            var entries = ChangeTracker
                .Entries()
                .Where(e => e.Entity is BaseEntity && (
                        e.State == EntityState.Added
                        || e.State == EntityState.Modified));

            foreach (var entityEntry in entries)
            {
                var entity = (BaseEntity)entityEntry.Entity;

                if (entityEntry.State == EntityState.Added)
                {
                    // Можно установить CreatedAt, если нужно
                }
                else if (entityEntry.State == EntityState.Modified)
                {
                    // Можно обновить UpdatedAt, если есть такое свойство
                    var updatedProperty = entity.GetType().GetProperty("UpdatedAt");
                    if (updatedProperty != null && updatedProperty.CanWrite)
                    {
                        updatedProperty.SetValue(entity, DateTime.UtcNow);
                    }
                }
            }

            return base.SaveChangesAsync(cancellationToken);
        }
    }
}
