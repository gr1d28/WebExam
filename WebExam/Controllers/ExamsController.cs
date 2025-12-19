using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WebExam.DTOs.Requests;
using WebExam.Services.Interfaces;

namespace WebExam.Controllers
{
    [Authorize]
    public class ExamsController : BaseApiController
    {
        private readonly IExamService _examService;

        public ExamsController(IExamService examService)
        {
            _examService = examService;
        }

        [HttpPost]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> CreateExam([FromBody] CreateExamRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var exam = await _examService.CreateExamAsync(request, userId);
                return OkResponse(exam, "Exam created successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UpdateExam(int id, [FromBody] UpdateExamRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var exam = await _examService.UpdateExamAsync(id, request, userId);
                return OkResponse(exam, "Exam updated successfully");
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

        [HttpDelete("{id}")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> DeleteExam(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _examService.DeleteExamAsync(id, userId);
                return OkResponse("Exam deleted successfully");
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

        [HttpGet]
        public async Task<IActionResult> GetExams([FromQuery] bool publishedOnly = true)
        {
            try
            {
                IEnumerable<object> exams;

                if (publishedOnly)
                {
                    exams = await _examService.GetPublishedExamsAsync();
                }
                else
                {
                    var userId = GetCurrentUserId();
                    exams = await _examService.GetUserExamsAsync(userId);
                }

                return OkResponse(exams);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetExamById(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var exam = await _examService.GetExamByIdAsync(id, userId);
                return OkResponse(exam);
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

        [HttpGet("{id}/take")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetExamForTaking(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var exam = await _examService.GetExamForTakingAsync(id, userId);
                return OkResponse(exam);
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost("{id}/publish")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> PublishExam(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _examService.PublishExamAsync(id, userId);
                return OkResponse("Exam published successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost("{id}/unpublish")]
        [Authorize(Roles = "Teacher,Admin")]
        public async Task<IActionResult> UnpublishExam(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                await _examService.UnpublishExamAsync(id, userId);
                return OkResponse("Exam unpublished successfully");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpGet("{id}/validate-access")]
        public async Task<IActionResult> ValidateAccess(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var hasAccess = await _examService.ValidateExamAccessAsync(id, userId);
                return OkResponse(new { HasAccess = hasAccess });
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }
    }
}
