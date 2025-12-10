using WebExam.Data.Interfaces;
using WebExam.DTOs.Responses;
using WebExam.Models;
using WebExam.Services.Interfaces;

namespace WebExam.Services
{
    public class ResultService : IResultService
    {
        private readonly IExamResultRepository _examResultRepository;
        private readonly IExamSessionRepository _examSessionRepository;
        private readonly IExamRepository _examRepository;
        private readonly IUserRepository _userRepository;

        public ResultService(
           IExamResultRepository examResultRepository,
           IExamSessionRepository examSessionRepository,
           IExamRepository examRepository,
           IUserRepository userRepository)
        {
            _examResultRepository = examResultRepository;
            _examSessionRepository = examSessionRepository;
            _examRepository = examRepository;
            _userRepository = userRepository;
        }

        public async Task<ExamResultResponse> GetResultBySessionAsync(int sessionId, int userId)
        {
            var session = await _examSessionRepository.GetByIdAsync(sessionId);
            if (session == null || session.UserId != userId)
            {
                throw new UnauthorizedAccessException("Доступ запрещен");
            }

            var result = await _examResultRepository.GetResultBySessionAsync(sessionId);
            if (result == null)
            {
                throw new KeyNotFoundException("Результат не найден");
            }

            return await MapToExamResultResponse(result);
        }

        public async Task<IEnumerable<UserExamResultResponse>> GetUserResultsAsync(int userId)
        {
            var results = await _examResultRepository.GetUserResultsAsync(userId);
            var groupedResults = results.GroupBy(r => r.ExamSession.ExamId);

            var response = new List<UserExamResultResponse>();

            foreach (var group in groupedResults)
            {
                var examId = group.Key;
                var examResults = group.ToList();

                var bestResult = examResults.OrderByDescending(r => r.Percentage).First();
                var exam = await _examRepository.GetByIdAsync(examId);

                response.Add(new UserExamResultResponse
                {
                    ExamId = examId,
                    ExamTitle = exam?.Title ?? "Неизвестный экзамен",
                    BestScore = bestResult.TotalScore,
                    MaxScore = bestResult.MaxPossibleScore,
                    BestPercentage = bestResult.Percentage,
                    HasPassed = bestResult.IsPassed,
                    AttemptCount = examResults.Count,
                    LastAttemptDate = examResults.Max(r => r.CalculatedAt)
                });
            }

            return response;
        }

        public async Task<IEnumerable<ExamStatisticsResponse>> GetExamStatisticsAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);
            if (exam == null)
            {
                throw new KeyNotFoundException("Экзамен не найден");
            }

            // Проверка прав доступа (только создатель или админ)
            var user = await _userRepository.GetByIdAsync(userId);
            if (exam.CreatedByUserId != userId && user?.Role != UserRole.Admin)
            {
                throw new UnauthorizedAccessException("Доступ запрещен");
            }

            var results = await _examResultRepository.GetExamResultsAsync(examId);
            var resultList = results.ToList();

            var statistics = new ExamStatisticsResponse
            {
                TotalAttempts = resultList.Count,
                PassedAttempts = resultList.Count(r => r.IsPassed),
                AverageScore = resultList.Any() ? resultList.Average(r => r.Percentage) : 0,
                PassRate = resultList.Any() ? (resultList.Count(r => r.IsPassed) * 100.0) / resultList.Count : 0
            };

            // Распределение оценок
            statistics.ScoreDistribution = CalculateScoreDistribution(resultList);

            return new List<ExamStatisticsResponse> { statistics };
        }

        public async Task<ExamResultDetailsResponse> GetResultDetailsAsync(int resultId, int userId)
        {
            var result = await _examResultRepository.GetResultWithDetailsAsync(resultId);
            if (result == null)
            {
                throw new KeyNotFoundException("Результат не найден");
            }

            if (result.ExamSession.UserId != userId)
            {
                throw new UnauthorizedAccessException("Доступ запрещен");
            }

            return await MapToExamResultDetailsResponse(result);
        }

        private List<ScoreDistributionResponse> CalculateScoreDistribution(List<ExamResult> results)
        {
            var distribution = new[]
            {
                new { Range = "90-100", Min = 90, Max = 100 },
                new { Range = "75-89", Min = 75, Max = 89 },
                new { Range = "60-74", Min = 60, Max = 74 },
                new { Range = "40-59", Min = 40, Max = 59 },
                new { Range = "0-39", Min = 0, Max = 39 }
            };

            return distribution.Select(range => new ScoreDistributionResponse
            {
                Range = range.Range,
                Count = results.Count(r => r.Percentage >= range.Min && r.Percentage <= range.Max)
            }).ToList();
        }

        private async Task<ExamResultResponse> MapToExamResultResponse(ExamResult result)
        {
            var session = await _examSessionRepository.GetByIdAsync(result.ExamSessionId);
            var exam = await _examRepository.GetByIdAsync(session?.ExamId ?? 0);

            return new ExamResultResponse
            {
                Id = result.Id,
                ExamSessionId = result.ExamSessionId,
                TotalScore = result.TotalScore,
                MaxPossibleScore = result.MaxPossibleScore,
                Percentage = result.Percentage,
                IsPassed = result.IsPassed,
                CalculatedAt = result.CalculatedAt,
                Feedback = result.Feedback,
                Exam = exam != null ? MapToExamResponse(exam) : null
            };
        }

        private async Task<ExamResultDetailsResponse> MapToExamResultDetailsResponse(ExamResult result)
        {
            var basicResponse = await MapToExamResultResponse(result);
            var detailsResponse = new ExamResultDetailsResponse
            {
                Id = basicResponse.Id,
                ExamSessionId = basicResponse.ExamSessionId,
                TotalScore = basicResponse.TotalScore,
                MaxPossibleScore = basicResponse.MaxPossibleScore,
                Percentage = basicResponse.Percentage,
                IsPassed = basicResponse.IsPassed,
                CalculatedAt = basicResponse.CalculatedAt,
                Feedback = basicResponse.Feedback,
                Exam = basicResponse.Exam
            };

            // TODO: Добавить детализацию по вопросам
            // Это потребует дополнительной логики для получения ответов пользователя
            // и сравнения с правильными ответами

            return detailsResponse;
        }

        private ExamResponse MapToExamResponse(Exam exam)
        {
            return new ExamResponse
            {
                Id = exam.Id,
                Title = exam.Title,
                Description = exam.Description,
                DurationMinutes = exam.DurationMinutes,
                PassingScore = exam.PassingScore,
                MaxAttempts = exam.MaxAttempts,
                IsPublished = exam.IsPublished,
                CreatedAt = exam.CreatedAt,
                UpdatedAt = exam.UpdatedAt,
                QuestionCount = exam.Questions?.Count ?? 0,
                CreatedBy = exam.CreatedBy != null ? MapToUserResponse(exam.CreatedBy) : null
            };
        }

        private UserResponse MapToUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            };
        }
    }
}
