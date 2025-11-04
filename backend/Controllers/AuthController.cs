using Microsoft.AspNetCore.Mvc;
using Dapper;
using System.Data;
using backend.Models;
using backend.Utils;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IDbConnection _db;
        public AuthController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 POST: /api/auth/login
        // ============================================================
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO dto)
        {
            // 🔹 Consulta combinada: Usuario + Empleado
            var sql = @"
                SELECT TOP 1 
                    U.UserID, 
                    U.Username, 
                    U.PasswordHash, 
                    U.Rol,
                    E.SlpCode, 
                    E.SlpName
                FROM Usuarios U
                LEFT JOIN Empleados E ON E.UserID = U.UserID
                WHERE U.Username = @Username";

            var user = await _db.QueryFirstOrDefaultAsync<dynamic>(sql, new { dto.Username });

            if (user == null)
                return Unauthorized(new
                {
                    success = false,
                    message = "❌ Usuario no encontrado."
                });

            // 🔹 Validar contraseña
            byte[] storedHash = (byte[])user.PasswordHash;
            if (!AuthTools.VerifyPassword(dto.Password, storedHash))
                return Unauthorized(new
                {
                    success = false,
                    message = "❌ Contraseña incorrecta."
                });

            // 🔹 Convertimos a int para el token
            int userId = Convert.ToInt32(user.UserID);

            // 🔹 Generar token JWT (mantienes tu mismo método)
            string token = AuthTools.GenerateToken(userId, user.Username, user.Rol);

            // 🔹 Respuesta estandarizada (ahora incluye el empleado)
            return Ok(new
            {
                success = true,
                message = "✅ Inicio de sesión exitoso.",
                userID = user.SlpCode ?? 0,      // 👈 Código real del vendedor
                vendedor = user.SlpName ?? "",   // 👈 Nombre completo del vendedor
                username = user.Username,
                rol = user.Rol,
                token
            });
        }
    }
}