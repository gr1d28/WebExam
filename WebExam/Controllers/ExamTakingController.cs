using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebExam.DTOs.Requests;
using WebExam.Services.Interfaces;

namespace WebExam.Controllers
{
    [Authorize(Roles = "Student")]
    public class ExamTakingController : BaseApiController
    {
        private readonly IExamTakingService _examTakingService;

        public ExamTakingController(IExamTakingService examTakingService)
        {
            _examTakingService = examTakingService;
        }

        [HttpPost("start")]
        public async Task<IActionResult> StartExam([FromBody] StartExamRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _examTakingService.StartExamAsync(request.ExamId, userId);
                return OkResponse(session, "Exam started successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("active/{examId}")]
        public async Task<IActionResult> GetActiveSession(int examId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _examTakingService.GetActiveSessionAsync(examId, userId);

                if (session == null)
                {
                    return NotFoundResponse("No active session found");
                }

                return OkResponse(session);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetSessionStatus(int sessionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var session = await _examTakingService.GetSessionStatusAsync(sessionId, userId);
                return OkResponse(session);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("session/{sessionId}/next-question")]
        public async Task<IActionResult> GetNextQuestion(int sessionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var question = await _examTakingService.GetNextQuestionAsync(sessionId, userId);

                if (question == null)
                {
                    return OkResponse("All questions answered");
                }

                return OkResponse(question);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("session/{sessionId}/question/{questionId}")]
        public async Task<IActionResult> GetQuestion(int sessionId, int questionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var question = await _examTakingService.GetQuestionAsync(sessionId, questionId, userId);
                return OkResponse(question);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost("session/{sessionId}/answer")]
        public async Task<IActionResult> SubmitAnswer(int sessionId, [FromBody] SubmitAnswerRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _examTakingService.SubmitAnswerAsync(sessionId, request, userId);
                return OkResponse("Answer submitted successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost("session/{sessionId}/submit")]
        public async Task<IActionResult> SubmitExam(int sessionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _examTakingService.SubmitExamAsync(sessionId, userId);
                return OkResponse(result, "Exam submitted successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("exam/{examId}/can-start")]
        public async Task<IActionResult> CanStartExam(int examId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var canStart = await _examTakingService.CanStartExamAsync(examId, userId);
                return OkResponse(new { CanStart = canStart });
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("exam/{examId}/remaining-attempts")]
        public async Task<IActionResult> GetRemainingAttempts(int examId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var attempts = await _examTakingService.GetRemainingAttemptsAsync(examId, userId);
                return OkResponse(new { RemainingAttempts = attempts });
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("sessions")]
        public async Task<IActionResult> GetUserSessions([FromQuery] int examId = 0)
        {
            try
            {
                var userId = GetCurrentUserId();
                var sessions = await _examTakingService.GetUserSessionsAsync(userId, examId);
                return OkResponse(sessions);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }
    }
}
