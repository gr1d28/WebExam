using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using WebExam.DTOs.Requests;
using WebExam.DTOs.Responses;
using WebExam.Services.Interfaces;

namespace WebExam.Controllers
{
    public class AuthController : BaseApiController
    {
        private readonly IAuthService _authService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IAuthService authService, ILogger<AuthController> logger)
        {
            _authService = authService;
            _logger = logger;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            _logger.LogInformation("Register data: {Requset}", request);
            try
            {
                var result = await _authService.RegisterAsync(request);
                return OkResponse(result, "Registration successful");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.LogInformation("Login attempt for email: {Email}", request.Email);
            try
            {
                var result = await _authService.LoginAsync(request);
                return OkResponse(result, "Login successful");
            }
            catch (Exception ex)
            {
                return UnauthorizedResponse(ex.Message);
            }
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var userId = GetCurrentUserId();
                var user = await _authService.GetCurrentUserAsync(userId);
                return OkResponse(user);
            }
            catch (Exception ex)
            {
                return UnauthorizedResponse(ex.Message);
            }
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _authService.ChangePasswordAsync(
                    userId, request.CurrentPassword, request.NewPassword);

                if (result)
                {
                    return OkResponse("Password changed successfully");
                }

                return UnauthorizedResponse("Current password is incorrect");
            }
            catch (Exception ex)
            {
                return ErrorResponse(ex.Message);
            }
        }
    }
    public class ChangePasswordRequest
    {
        public string CurrentPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
