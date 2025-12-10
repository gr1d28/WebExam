using WebExam.Data.Interfaces;
using WebExam.DTOs.Requests;
using WebExam.DTOs.Responses;
using WebExam.Models;
using WebExam.Services.Interfaces;

namespace WebExam.Services
{
    public class ExamTakingService : IExamTakingService
    {
        private readonly IExamRepository _examRepository;
        private readonly IExamSessionRepository _examSessionRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IUserAnswerRepository _userAnswerRepository;
        private readonly ISelectedAnswerOptionRepository _selectedAnswerOptionRepository;
        private readonly IExamResultRepository _examResultRepository;
        private readonly IUserRepository _userRepository;

        public ExamTakingService(
            IExamRepository examRepository,
            IExamSessionRepository examSessionRepository,
            IQuestionRepository questionRepository,
            IUserAnswerRepository userAnswerRepository,
            ISelectedAnswerOptionRepository selectedAnswerOptionRepository,
            IExamResultRepository examResultRepository,
            IUserRepository userRepository)
        {
            _examRepository = examRepository;
            _examSessionRepository = examSessionRepository;
            _questionRepository = questionRepository;
            _userAnswerRepository = userAnswerRepository;
            _selectedAnswerOptionRepository = selectedAnswerOptionRepository;
            _examResultRepository = examResultRepository;
            _userRepository = userRepository;
        }

        public async Task<ExamSessionResponse> StartExamAsync(int examId, int userId)
        {
            // Проверка возможности начать экзамен
            if (!await CanStartExamAsync(examId, userId))
            {
                throw new InvalidOperationException("Невозможно начать экзамен");
            }

            // Получение экзамена
            var exam = await _examRepository.GetExamWithQuestionsAsync(examId);
            if (exam == null || !exam.IsPublished)
            {
                throw new KeyNotFoundException("Экзамен не найден или не опубликован");
            }

            // Создание сессии
            var session = new ExamSession
            {
                UserId = userId,
                ExamId = examId,
                StartTime = DateTime.UtcNow,
                Status = ExamSessionStatus.InProgress,
                CurrentQuestionIndex = 0
            };

            await _examSessionRepository.AddAsync(session);

            // Получение первого вопроса
            var firstQuestion = exam.Questions.OrderBy(q => q.Order).FirstOrDefault();
            if (firstQuestion == null)
            {
                throw new InvalidOperationException("В экзамене нет вопросов");
            }

            return await MapToExamSessionResponse(session, firstQuestion);
        }

        public async Task<QuestionResponse> GetNextQuestionAsync(int sessionId, int userId)
        {
            var session = await ValidateAndGetSessionAsync(sessionId, userId);

            // Получение всех вопросов экзамена
            var questions = await _questionRepository.GetQuestionsByExamAsync(session.ExamId);
            var orderedQuestions = questions.OrderBy(q => q.Order).ToList();

            if (!orderedQuestions.Any())
            {
                throw new InvalidOperationException("В экзамене нет вопросов");
            }

            // Определение следующего вопроса
            var nextIndex = session.CurrentQuestionIndex;
            Question nextQuestion;

            // Если текущий вопрос отвечен, переходим к следующему
            var currentQuestionId = orderedQuestions.ElementAtOrDefault(session.CurrentQuestionIndex)?.Id;
            if (currentQuestionId.HasValue &&
                await _userAnswerRepository.HasAnswerForQuestionAsync(sessionId, currentQuestionId.Value))
            {
                nextIndex++;
            }

            // Проверка границ
            if (nextIndex >= orderedQuestions.Count)
            {
                // Все вопросы отвечены
                return null;
            }

            nextQuestion = orderedQuestions[nextIndex];

            // Обновление текущего индекса
            session.CurrentQuestionIndex = nextIndex;
            await _examSessionRepository.UpdateAsync(session);

            return MapToQuestionResponse(nextQuestion);
        }

        public async Task<QuestionResponse> GetQuestionAsync(int sessionId, int questionId, int userId)
        {
            var session = await ValidateAndGetSessionAsync(sessionId, userId);

            // Получение вопроса
            var question = await _questionRepository.GetQuestionWithOptionsAsync(questionId);
            if (question == null || question.ExamId != session.ExamId)
            {
                throw new KeyNotFoundException("Вопрос не найден");
            }

            return MapToQuestionResponse(question);
        }

        public async Task SubmitAnswerAsync(int sessionId, SubmitAnswerRequest request, int userId)
        {
            var session = await ValidateAndGetSessionAsync(sessionId, userId);
            var question = await _questionRepository.GetQuestionWithOptionsAsync(request.QuestionId);

            if (question == null || question.ExamId != session.ExamId)
            {
                throw new KeyNotFoundException("Вопрос не найден");
            }

            // Проверка типа вопроса
            ValidateAnswerType(question.Type, request);

            // Поиск существующего ответа
            var existingAnswer = await _userAnswerRepository.GetAnswerForQuestionAsync(sessionId, request.QuestionId);

            if (existingAnswer != null)
            {
                // Обновление существующего ответа
                await UpdateUserAnswerAsync(existingAnswer, request, question.Type);
            }
            else
            {
                // Создание нового ответа
                await CreateUserAnswerAsync(sessionId, request, question.Type);
            }
        }

        public async Task<ExamResultResponse> SubmitExamAsync(int sessionId, int userId)
        {
            var session = await ValidateAndGetSessionAsync(sessionId, userId);

            // Проверка что сессия активна
            if (session.Status != ExamSessionStatus.InProgress)
            {
                throw new InvalidOperationException("Экзамен уже завершен");
            }

            // Завершение сессии
            session.Status = ExamSessionStatus.Submitted;
            session.EndTime = DateTime.UtcNow;
            await _examSessionRepository.UpdateAsync(session);

            // Расчет результатов
            var result = await CalculateExamResultAsync(session);
            await _examResultRepository.AddAsync(result);

            return await MapToExamResultResponse(result);
        }

        public async Task<ExamSessionResponse> GetActiveSessionAsync(int examId, int userId)
        {
            var session = await _examSessionRepository.GetActiveSessionAsync(userId, examId);

            if (session == null)
            {
                return null;
            }

            // Проверка истечения времени
            await CheckAndHandleExpiredSessionAsync(session);

            // Получение текущего вопроса
            var questions = await _questionRepository.GetQuestionsByExamAsync(examId);
            var orderedQuestions = questions.OrderBy(q => q.Order).ToList();

            var currentQuestion = orderedQuestions.ElementAtOrDefault(session.CurrentQuestionIndex);

            return await MapToExamSessionResponse(session, currentQuestion);
        }

        public async Task<ExamSessionResponse> GetSessionStatusAsync(int sessionId, int userId)
        {
            var session = await ValidateAndGetSessionAsync(sessionId, userId);

            // Проверка истечения времени
            await CheckAndHandleExpiredSessionAsync(session);

            // Получение текущего вопроса
            var questions = await _questionRepository.GetQuestionsByExamAsync(session.ExamId);
            var orderedQuestions = questions.OrderBy(q => q.Order).ToList();

            var currentQuestion = orderedQuestions.ElementAtOrDefault(session.CurrentQuestionIndex);

            return await MapToExamSessionResponse(session, currentQuestion);
        }

        public async Task<bool> ValidateSessionAccessAsync(int sessionId, int userId)
        {
            var session = await _examSessionRepository.GetByIdAsync(sessionId);
            return session != null && session.UserId == userId;
        }

        public async Task EndExpiredSessionsAsync()
        {
            await _examSessionRepository.EndExpiredSessionsAsync();
        }

        public async Task<bool> CanStartExamAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);
            if (exam == null || !exam.IsPublished)
            {
                return false;
            }

            // Проверка активной сессии
            if (await _examSessionRepository.HasActiveSessionForExamAsync(userId, examId))
            {
                return false;
            }

            // Проверка количества попыток
            var attemptCount = await _examSessionRepository.GetUserAttemptCountAsync(userId, examId);
            return attemptCount < exam.MaxAttempts;
        }

        public async Task<int> GetRemainingAttemptsAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);
            if (exam == null)
            {
                return 0;
            }

            var attemptCount = await _examSessionRepository.GetUserAttemptCountAsync(userId, examId);
            return Math.Max(0, exam.MaxAttempts - attemptCount);
        }

        public async Task<IEnumerable<ExamSessionResponse>> GetUserSessionsAsync(int userId, int examId = 0)
        {
            IEnumerable<ExamSession> sessions;

            if (examId > 0)
            {
                sessions = await _examSessionRepository.GetExamSessionsAsync(examId);
                sessions = sessions.Where(s => s.UserId == userId);
            }
            else
            {
                sessions = await _examSessionRepository.GetUserSessionsAsync(userId);
            }

            var result = new List<ExamSessionResponse>();

            foreach (var session in sessions.OrderByDescending(s => s.StartTime))
            {
                var questions = await _questionRepository.GetQuestionsByExamAsync(session.ExamId);
                var currentQuestion = questions.OrderBy(q => q.Order)
                    .ElementAtOrDefault(session.CurrentQuestionIndex);

                result.Add(await MapToExamSessionResponse(session, currentQuestion));
            }

            return result;
        }

        private async Task<ExamSession> ValidateAndGetSessionAsync(int sessionId, int userId)
        {
            var session = await _examSessionRepository.GetByIdAsync(sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException("Сессия не найдена");
            }

            if (session.UserId != userId)
            {
                throw new UnauthorizedAccessException("Доступ запрещен");
            }

            if (session.Status != ExamSessionStatus.InProgress)
            {
                throw new InvalidOperationException("Экзамен уже завершен");
            }

            // Проверка истечения времени
            await CheckAndHandleExpiredSessionAsync(session);

            return session;
        }

        private async Task CheckAndHandleExpiredSessionAsync(ExamSession session)
        {
            var exam = await _examRepository.GetByIdAsync(session.ExamId);
            if (exam == null) return;

            var endTime = session.StartTime.AddMinutes(exam.DurationMinutes);

            if (DateTime.UtcNow > endTime && session.Status == ExamSessionStatus.InProgress)
            {
                session.Status = ExamSessionStatus.Expired;
                session.EndTime = endTime;
                await _examSessionRepository.UpdateAsync(session);
            }
        }

        private void ValidateAnswerType(QuestionType type, SubmitAnswerRequest request)
        {
            switch (type)
            {
                case QuestionType.SingleChoice:
                    if (request.SelectedOptionIds.Count > 1)
                    {
                        throw new ArgumentException("Для вопроса с одним выбором можно выбрать только один вариант");
                    }
                    break;

                case QuestionType.TextAnswer:
                    if (string.IsNullOrWhiteSpace(request.AnswerText))
                    {
                        throw new ArgumentException("Требуется текстовый ответ");
                    }
                    break;

                case QuestionType.MultipleChoice:
                    if (!request.SelectedOptionIds.Any())
                    {
                        throw new ArgumentException("Требуется выбрать хотя бы один вариант");
                    }
                    break;
            }
        }

        private async Task CreateUserAnswerAsync(int sessionId, SubmitAnswerRequest request, QuestionType questionType)
        {
            var userAnswer = new UserAnswer
            {
                ExamSessionId = sessionId,
                QuestionId = request.QuestionId,
                AnswerText = request.AnswerText,
                AnsweredAt = DateTime.UtcNow
            };

            await _userAnswerRepository.AddAsync(userAnswer);

            // Сохранение выбранных вариантов для вопросов с выбором
            if (questionType == QuestionType.SingleChoice || questionType == QuestionType.MultipleChoice)
            {
                if (request.SelectedOptionIds.Any())
                {
                    await _selectedAnswerOptionRepository.AddSelectedOptionsAsync(
                        userAnswer.Id, request.SelectedOptionIds);
                }
            }
        }

        private async Task UpdateUserAnswerAsync(UserAnswer existingAnswer, SubmitAnswerRequest request, QuestionType questionType)
        {
            existingAnswer.AnswerText = request.AnswerText;
            existingAnswer.AnsweredAt = DateTime.UtcNow;

            await _userAnswerRepository.UpdateAsync(existingAnswer);

            // Обновление выбранных вариантов для вопросов с выбором
            if (questionType == QuestionType.SingleChoice || questionType == QuestionType.MultipleChoice)
            {
                await _selectedAnswerOptionRepository.UpdateSelectedOptionsAsync(
                    existingAnswer.Id, request.SelectedOptionIds);
            }
        }

        private async Task<ExamResult> CalculateExamResultAsync(ExamSession session)
        {
            var exam = await _examRepository.GetExamWithQuestionsAsync(session.ExamId);
            var userAnswers = await _userAnswerRepository.GetAnswersWithOptionsBySessionAsync(session.Id);

            int totalScore = 0;
            int maxPossibleScore = exam.Questions.Sum(q => q.Points);
            var questionResults = new List<QuestionResult>();

            foreach (var question in exam.Questions)
            {
                var userAnswer = userAnswers.FirstOrDefault(ua => ua.QuestionId == question.Id);
                var score = CalculateQuestionScore(question, userAnswer);

                totalScore += score;

                questionResults.Add(new QuestionResult
                {
                    QuestionId = question.Id,
                    PointsEarned = score,
                    MaxPoints = question.Points,
                    IsCorrect = score == question.Points
                });
            }

            double percentage = maxPossibleScore > 0 ? (totalScore * 100.0) / maxPossibleScore : 0;
            bool isPassed = percentage >= exam.PassingScore;

            return new ExamResult
            {
                ExamSessionId = session.Id,
                TotalScore = totalScore,
                MaxPossibleScore = maxPossibleScore,
                Percentage = Math.Round(percentage, 2),
                IsPassed = isPassed,
                CalculatedAt = DateTime.UtcNow,
                Feedback = GenerateFeedback(isPassed, percentage)
            };
        }

        private int CalculateQuestionScore(Question question, UserAnswer userAnswer)
        {
            if (userAnswer == null) return 0;

            switch (question.Type)
            {
                case QuestionType.SingleChoice:
                case QuestionType.MultipleChoice:
                    return CalculateChoiceQuestionScore(question, userAnswer);

                case QuestionType.TextAnswer:
                    // Для текстовых вопросов требуется ручная проверка
                    return 0;

                default:
                    return 0;
            }
        }

        private int CalculateChoiceQuestionScore(Question question, UserAnswer userAnswer)
        {
            var correctOptionIds = question.AnswerOptions
                .Where(ao => ao.IsCorrect)
                .Select(ao => ao.Id)
                .ToHashSet();

            var selectedOptionIds = userAnswer.SelectedOptions?
                .Select(so => so.AnswerOptionId)
                .ToHashSet() ?? new HashSet<int>();

            if (question.Type == QuestionType.SingleChoice)
            {
                // Для SingleChoice: полный балл если выбран правильный вариант
                return selectedOptionIds.Any(id => correctOptionIds.Contains(id))
                    ? question.Points : 0;
            }
            else // MultipleChoice
            {
                // Для MultipleChoice: пропорциональные баллы
                if (!selectedOptionIds.Any()) return 0;

                int correctSelected = selectedOptionIds.Count(id => correctOptionIds.Contains(id));
                int incorrectSelected = selectedOptionIds.Count(id => !correctOptionIds.Contains(id));

                // Вычитаем баллы за неправильные ответы (можно изменить логику)
                double proportion = (double)correctSelected / correctOptionIds.Count;
                return Math.Max(0, (int)(question.Points * proportion - incorrectSelected));
            }
        }

        private string GenerateFeedback(bool isPassed, double percentage)
        {
            if (isPassed)
            {
                if (percentage >= 90) return "Отличный результат!";
                if (percentage >= 75) return "Хороший результат!";
                return "Экзамен сдан успешно.";
            }
            else
            {
                if (percentage >= 50) return "Почти получилось, попробуйте еще раз!";
                return "Необходимо лучше подготовиться к экзамену.";
            }
        }

        private async Task<ExamSessionResponse> MapToExamSessionResponse(ExamSession session, Question currentQuestion = null)
        {
            var exam = await _examRepository.GetByIdAsync(session.ExamId);
            var timeRemaining = CalculateTimeRemaining(session, exam);

            return new ExamSessionResponse
            {
                Id = session.Id,
                ExamId = session.ExamId,
                ExamTitle = exam?.Title ?? "Неизвестный экзамен",
                StartTime = session.StartTime,
                EndTime = session.EndTime,
                Status = session.Status,
                CurrentQuestionIndex = session.CurrentQuestionIndex,
                TotalQuestions = exam?.Questions?.Count ?? 0,
                TimeRemainingSeconds = timeRemaining,
                CurrentQuestion = currentQuestion != null ? MapToQuestionResponse(currentQuestion) : null
            };
        }

        private int CalculateTimeRemaining(ExamSession session, Exam exam)
        {
            if (exam == null || session.EndTime.HasValue) return 0;

            var totalSeconds = exam.DurationMinutes * 60;
            var elapsedSeconds = (DateTime.UtcNow - session.StartTime).TotalSeconds;
            var remainingSeconds = totalSeconds - (int)elapsedSeconds;

            return Math.Max(0, remainingSeconds);
        }

        private QuestionResponse MapToQuestionResponse(Question question)
        {
            return new QuestionResponse
            {
                Id = question.Id,
                Text = question.Text,
                Type = question.Type,
                Points = question.Points,
                Order = question.Order,
                AnswerOptions = question.AnswerOptions?
                    .OrderBy(ao => ao.Order)
                    .Select(ao => new AnswerOptionResponse
                    {
                        Id = ao.Id,
                        Text = ao.Text,
                        Order = ao.Order
                    })
                    .ToList() ?? new List<AnswerOptionResponse>()
            };
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

        // Вспомогательный класс для расчета результатов по вопросам
        private class QuestionResult
        {
            public int QuestionId { get; set; }
            public int PointsEarned { get; set; }
            public int MaxPoints { get; set; }
            public bool IsCorrect { get; set; }
        }
    }
}
