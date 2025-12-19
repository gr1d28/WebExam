using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebExam.Services.Interfaces;

namespace WebExam.Controllers
{
    [Authorize]
    public class ResultsController : BaseApiController
    {
        private readonly IResultService _resultService;

        public ResultsController(IResultService resultService)
        {
            _resultService = resultService;
        }

        [HttpGet("session/{sessionId}")]
        public async Task<IActionResult> GetResultBySession(int sessionId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _resultService.GetResultBySessionAsync(sessionId, userId);
                return OkResponse(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return UnauthorizedResponse(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFoundResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("my-results")]
        public async Task<IActionResult> GetMyResults()
        {
            try
            {
                var userId = GetCurrentUserId();
                var results = await _resultService.GetUserResultsAsync(userId);
                return OkResponse(results);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("exam/{examId}/statistics")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetExamStatistics(int examId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var statistics = await _resultService.GetExamStatisticsAsync(examId, userId);
                return OkResponse(statistics);
            }
            catch (UnauthorizedAccessException ex)
            {
                return UnauthorizedResponse(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFoundResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("result/{resultId}")]
        public async Task<IActionResult> GetResultDetails(int resultId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _resultService.GetResultDetailsAsync(resultId, userId);
                return OkResponse(result);
            }
            catch (UnauthorizedAccessException ex)
            {
                return UnauthorizedResponse(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFoundResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("exam/{examId}/attempts")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> GetExamAttempts(int examId)
        {
            try
            {
                var userId = GetCurrentUserId();
                var attempts = await _resultService.GetExamAttemptsAsync(examId, userId);
                return OkResponse(attempts);
            }
            catch (UnauthorizedAccessException ex)
            {
                return UnauthorizedResponse(ex.Message);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFoundResponse(ex.Message);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }
    }
}
