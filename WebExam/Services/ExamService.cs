using WebExam.Data.Interfaces;
using WebExam.DTOs.Requests;
using WebExam.DTOs.Responses;
using WebExam.Models;
using WebExam.Services.Interfaces;

namespace WebExam.Services
{
    public class ExamService : IExamService
    {
        private readonly IExamRepository _examRepository;
        private readonly IUserRepository _userRepository;
        private readonly IQuestionRepository _questionRepository;
        private readonly IAnswerOptionRepository _answerOptionRepository;

        public ExamService(
            IExamRepository examRepository,
            IUserRepository userRepository,
            IQuestionRepository questionRepository,
            IAnswerOptionRepository answerOptionRepository)
        {
            _examRepository = examRepository;
            _userRepository = userRepository;
            _questionRepository = questionRepository;
            _answerOptionRepository = answerOptionRepository;
        }

        public async Task<ExamDetailsResponse> CreateExamAsync(CreateExamRequest request, int creatorId)
        {
            // Проверка прав доступа
            var creator = await _userRepository.GetByIdAsync(creatorId);
            if (creator == null || creator.Role != UserRole.Teacher)
            {
                throw new UnauthorizedAccessException("Только преподаватели могут создавать экзамены");
            }

            // Создание экзамена
            var exam = new Exam
            {
                Title = request.Title,
                Description = request.Description,
                DurationMinutes = request.DurationMinutes,
                PassingScore = request.PassingScore,
                MaxAttempts = request.MaxAttempts,
                IsPublished = request.IsPublished,
                CreatedAt = DateTime.UtcNow,
                CreatedByUserId = creatorId
            };

            await _examRepository.AddAsync(exam);

            // Создание вопросов
            foreach (var questionRequest in request.Questions)
            {
                await CreateQuestionAsync(exam.Id, questionRequest);
            }

            return await GetExamDetailsAsync(exam.Id);
        }

        public async Task<ExamDetailsResponse> UpdateExamAsync(int examId, UpdateExamRequest request, int userId)
        {
            var exam = await _examRepository.GetExamWithQuestionsAsync(examId);

            if (exam == null)
            {
                throw new KeyNotFoundException("Экзамен не найден");
            }

            // Проверка прав доступа
            if (exam.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException("Вы не являетесь создателем этого экзамена");
            }

            // Обновление полей
            exam.Title = request.Title;
            exam.Description = request.Description;
            exam.DurationMinutes = request.DurationMinutes;
            exam.PassingScore = request.PassingScore;
            exam.MaxAttempts = request.MaxAttempts;
            exam.IsPublished = request.IsPublished;
            exam.UpdatedAt = DateTime.UtcNow;

            if (request.Questions != null)
            {
                await UpdateQuestionsAsync(examId, request.Questions);
            }

            await _examRepository.UpdateAsync(exam);

            return await GetExamDetailsAsync(examId);
        }

        public async Task DeleteExamAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);

            if (exam == null)
            {
                throw new KeyNotFoundException("Экзамен не найден");
            }

            // Проверка прав доступа
            if (exam.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException("Вы не являетесь создателем этого экзамена");
            }

            // Проверка активных сессий
            if (await _examRepository.ExamHasActiveSessionsAsync(examId))
            {
                throw new InvalidOperationException("Невозможно удалить экзамен с активными сессиями");
            }

            await _examRepository.DeleteAsync(exam);
        }

        public async Task<ExamDetailsResponse> GetExamByIdAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetExamWithDetailsAsync(examId);

            if (exam == null)
            {
                throw new KeyNotFoundException("Экзамен не найден");
            }

            // Проверка прав доступа
            if (!exam.IsPublished && exam.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException("У вас нет доступа к этому экзамену");
            }

            return MapToExamDetailsResponse(exam);
        }

        public async Task<ExamDetailsResponse> GetExamForTakingAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetExamWithQuestionsAsync(examId);

            if (exam == null || !exam.IsPublished)
            {
                throw new KeyNotFoundException("Экзамен не найден или не опубликован");
            }

            // Для студента скрываем правильные ответы
            var response = MapToExamDetailsResponse(exam);

            // Скрываем IsCorrect в AnswerOptions
            foreach (var question in response.Questions)
            {
                foreach (var option in question.AnswerOptions)
                {
                    // Убираем информацию о правильности ответа
                    option.IsCorrect = null;
                }
            }

            return response;
        }

        public async Task<IEnumerable<ExamResponse>> GetPublishedExamsAsync()
        {
            var exams = await _examRepository.GetPublishedExamsAsync();
            return exams.Select(MapToExamResponse);
        }

        public async Task<IEnumerable<ExamResponse>> GetUserExamsAsync(int userId)
        {
            var exams = await _examRepository.GetExamsByCreatorAsync(userId);
            return exams.Select(MapToExamResponse);
        }

        public async Task PublishExamAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);

            if (exam == null)
            {
                throw new KeyNotFoundException("Экзамен не найден");
            }

            if (exam.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException("Вы не являетесь создателем этого экзамена");
            }

            // Проверка наличия вопросов
            var questionCount = await _examRepository.GetExamQuestionCountAsync(examId);
            if (questionCount == 0)
            {
                throw new InvalidOperationException("Нельзя опубликовать экзамен без вопросов");
            }

            exam.IsPublished = true;
            exam.UpdatedAt = DateTime.UtcNow;

            await _examRepository.UpdateAsync(exam);
        }

        public async Task UnpublishExamAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);

            if (exam == null)
            {
                throw new KeyNotFoundException("Экзамен не найден");
            }

            if (exam.CreatedByUserId != userId)
            {
                throw new UnauthorizedAccessException("Вы не являетесь создателем этого экзамена");
            }

            exam.IsPublished = false;
            exam.UpdatedAt = DateTime.UtcNow;

            await _examRepository.UpdateAsync(exam);
        }

        public async Task<bool> ValidateExamAccessAsync(int examId, int userId)
        {
            var exam = await _examRepository.GetByIdAsync(examId);

            if (exam == null)
            {
                return false;
            }

            // Доступ если экзамен опубликован или пользователь - создатель
            return exam.IsPublished || exam.CreatedByUserId == userId;
        }

        private async Task<Question> CreateQuestionAsync(int examId, CreateQuestionRequest request)
        {
            var question = new Question
            {
                ExamId = examId,
                Text = request.Text,
                Type = request.Type,
                Points = request.Points,
                Order = request.Order
            };

            await _questionRepository.AddAsync(question);

            // Создание вариантов ответов
            foreach (var optionRequest in request.AnswerOptions)
            {
                var option = new AnswerOption
                {
                    QuestionId = question.Id,
                    Text = optionRequest.Text,
                    IsCorrect = optionRequest.IsCorrect,
                    Order = optionRequest.Order
                };

                await _answerOptionRepository.AddAsync(option);
            }

            return question;
        }

        private async Task<ExamDetailsResponse> GetExamDetailsAsync(int examId)
        {
            var exam = await _examRepository.GetExamWithDetailsAsync(examId);
            return MapToExamDetailsResponse(exam);
        }

        private async Task UpdateQuestionsAsync(int examId, List<UpdateQuestionRequest> questionRequests)
        {
            // Получаем текущие вопросы
            var currentQuestions = await _questionRepository.GetQuestionsByExamAsync(examId);
            var currentQuestionDict = currentQuestions.ToDictionary(q => q.Id);

            // Словарь для хранения ID новых вопросов
            var newQuestionIds = new Dictionary<int, int>();

            foreach (var questionRequest in questionRequests)
            {
                if (questionRequest.Id.HasValue && currentQuestionDict.ContainsKey(questionRequest.Id.Value))
                {
                    // Обновление существующего вопроса
                    var existingQuestion = currentQuestionDict[questionRequest.Id.Value];

                    // Удаляем из словаря, чтобы потом удалить оставшиеся
                    currentQuestionDict.Remove(questionRequest.Id.Value);

                    // Обновляем поля вопроса
                    existingQuestion.Text = questionRequest.Text;
                    existingQuestion.Type = questionRequest.Type;
                    existingQuestion.Points = questionRequest.Points;
                    existingQuestion.Order = questionRequest.Order;

                    await _questionRepository.UpdateAsync(existingQuestion);

                    // Обновляем варианты ответов
                    await UpdateAnswerOptionsAsync(existingQuestion.Id, questionRequest.AnswerOptions);
                }
                else
                {
                    // Создание нового вопроса
                    var newQuestion = new Question
                    {
                        ExamId = examId,
                        Text = questionRequest.Text,
                        Type = questionRequest.Type,
                        Points = questionRequest.Points,
                        Order = questionRequest.Order,
                    };

                    await _questionRepository.AddAsync(newQuestion);

                    // Сохраняем ID для обновления вариантов ответов
                    newQuestionIds[questionRequest.Order] = newQuestion.Id;

                    // Создаем варианты ответов
                    foreach (var optionRequest in questionRequest.AnswerOptions)
                    {
                        var option = new AnswerOption
                        {
                            QuestionId = newQuestion.Id,
                            Text = optionRequest.Text,
                            IsCorrect = optionRequest.IsCorrect,
                            Order = optionRequest.Order ?? 0,
                        };

                        await _answerOptionRepository.AddAsync(option);
                    }
                }
            }

            // Удаляем вопросы, которые не были обновлены (удалены пользователем)
            foreach (var questionToDelete in currentQuestionDict.Values)
            {
                await _questionRepository.DeleteAsync(questionToDelete);
            }
        }

        // Добавляем метод для обновления вариантов ответов
        private async Task UpdateAnswerOptionsAsync(int questionId, List<UpdateAnswerOptionRequest> optionRequests)
        {
            // Получаем текущие варианты ответов
            var currentOptions = await _answerOptionRepository.GetAnswerOptionsByQuestionAsync(questionId);
            var currentOptionDict = currentOptions.ToDictionary(o => o.Id);

            foreach (var optionRequest in optionRequests)
            {
                if (optionRequest.Id.HasValue && currentOptionDict.ContainsKey(optionRequest.Id.Value))
                {
                    // Обновление существующего варианта
                    var existingOption = currentOptionDict[optionRequest.Id.Value];

                    // Удаляем из словаря, чтобы потом удалить оставшиеся
                    currentOptionDict.Remove(optionRequest.Id.Value);

                    // Обновляем поля варианта
                    existingOption.Text = optionRequest.Text;
                    existingOption.IsCorrect = optionRequest.IsCorrect;
                    existingOption.Order = optionRequest.Order ?? existingOption.Order;

                    await _answerOptionRepository.UpdateAsync(existingOption);
                }
                else
                {
                    // Создание нового варианта ответа
                    var newOption = new AnswerOption
                    {
                        QuestionId = questionId,
                        Text = optionRequest.Text,
                        IsCorrect = optionRequest.IsCorrect,
                        Order = optionRequest.Order ?? 0,
                    };

                    await _answerOptionRepository.AddAsync(newOption);
                }
            }

            // Удаляем варианты ответов, которые не были обновлены
            foreach (var optionToDelete in currentOptionDict.Values)
            {
                await _answerOptionRepository.DeleteAsync(optionToDelete);
            }
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

        private ExamDetailsResponse MapToExamDetailsResponse(Exam exam)
        {
            var response = new ExamDetailsResponse
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

            if (exam.Questions != null)
            {
                response.Questions = exam.Questions
                    .OrderBy(q => q.Order)
                    .Select(q => new QuestionResponse
                    {
                        Id = q.Id,
                        Text = q.Text,
                        Type = q.Type,
                        Points = q.Points,
                        Order = q.Order,
                        AnswerOptions = q.AnswerOptions?
                            .OrderBy(ao => ao.Order)
                            .Select(ao => new AnswerOptionResponse
                            {
                                Id = ao.Id,
                                Text = ao.Text,
                                Order = ao.Order
                            })
                            .ToList() ?? new List<AnswerOptionResponse>()
                    })
                    .ToList();
            }

            return response;
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
