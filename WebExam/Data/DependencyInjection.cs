using Microsoft.EntityFrameworkCore;
using WebExam.Data.Interfaces;
using WebExam.Data.Repositories;
using WebExam.Services;
using WebExam.Services.Interfaces;

namespace WebExam.Data
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(
            this IServiceCollection services,
            IConfiguration configuration)
        {
            // DbContext
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    configuration.GetConnectionString("DefaultConnection"),
                    sqlOptions =>
                    {
                        sqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
                        sqlOptions.EnableRetryOnFailure(
                            maxRetryCount: 5,
                            maxRetryDelay: TimeSpan.FromSeconds(30),
                            errorNumbersToAdd: null);
                    }));

            // Репозитории
            services.AddScoped<IUserRepository, UserRepository>();
            services.AddScoped<IExamRepository, ExamRepository>();
            services.AddScoped<IQuestionRepository, QuestionRepository>();
            services.AddScoped<IAnswerOptionRepository, AnswerOptionRepository>();
            services.AddScoped<IExamSessionRepository, ExamSessionRepository>();
            services.AddScoped<IUserAnswerRepository, UserAnswerRepository>();
            services.AddScoped<ISelectedAnswerOptionRepository, SelectedAnswerOptionRepository>();
            services.AddScoped<IExamResultRepository, ExamResultRepository>();

            return services;
        }

        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            // Регистрация сервисов
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IExamService, ExamService>();
            services.AddScoped<IExamTakingService, ExamTakingService>();
            services.AddScoped<IResultService, ResultService>();

            return services;
        }
    }
}
