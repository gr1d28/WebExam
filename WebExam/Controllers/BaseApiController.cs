using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace WebExam.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        protected int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("id")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("User ID not found in token");
            }

            return userId;
        }

        protected IActionResult OkResponse<T>(T data, string message = null)
        {
            var response = new ApiResponse<T>
            {
                Success = true,
                Data = data,
                Message = message
            };
            return Ok(response);
        }

        protected IActionResult OkResponse(string message)
        {
            var response = new ApiResponse<object>
            {
                Success = true,
                Message = message
            };
            return Ok(response);
        }

        protected IActionResult ErrorResponse(string message, int statusCode = 400)
        {
            var response = new ApiResponse<object>
            {
                Success = false,
                Message = message
            };
            return StatusCode(statusCode, response);
        }

        protected IActionResult NotFoundResponse(string message = "Resource not found")
        {
            return ErrorResponse(message, 404);
        }

        protected IActionResult UnauthorizedResponse(string message = "Unauthorized")
        {
            return ErrorResponse(message, 401);
        }
    }

    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; }
    }
}
