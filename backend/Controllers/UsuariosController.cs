using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using backend.Models;
using System.Security.Cryptography;
using System.Text;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsuariosController : ControllerBase
    {
        private readonly IDbConnection _db;
        public UsuariosController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 GET: api/usuarios
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerUsuarios()
        {
            var sql = "SELECT UserID, Username, Rol FROM Usuarios ORDER BY UserID";
            var data = await _db.QueryAsync(sql);
            return Ok(data);
        }

        // ============================================================
        // 🔹 POST: api/usuarios
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> RegistrarUsuario([FromBody] UsuarioDTO usuario)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(usuario.Password))
                    return BadRequest("❌ La contraseña es obligatoria.");

                byte[] hash = HashSha256(usuario.Password);

                var parameters = new
                {
                    Accion = "ADD",
                    UserID = (int?)null,
                    Username = usuario.Username,
                    PasswordHash = hash,
                    Rol = usuario.Rol
                };

                await _db.ExecuteAsync("sp_GuardarUsuario", parameters, commandType: CommandType.StoredProcedure);
                return Ok(new { message = $"✅ Usuario {usuario.Username} registrado correctamente." });
            }
            catch (Exception ex)
            {
                return Problem($"❌ Error al registrar usuario: {ex.Message}");
            }
        }

        // ============================================================
        // 🔹 PUT: api/usuarios/{UserID}
        // ============================================================
        [HttpPut("{UserID:int}")]
        public async Task<IActionResult> ActualizarUsuario(int UserID, [FromBody] UsuarioDTO usuario)
        {
            try
            {
                byte[] passwordHash;

                if (!string.IsNullOrWhiteSpace(usuario.Password))
                {
                    passwordHash = HashSha256(usuario.Password);
                }
                else
                {
                    // conservar el hash actual
                    var current = await _db.QueryFirstOrDefaultAsync<byte[]>(
                        "SELECT PasswordHash FROM Usuarios WHERE UserID = @UserID",
                        new { UserID }
                    );

                    if (current == null)
                        return NotFound("⚠️ Usuario no existe.");

                    passwordHash = current;
                }

                var parameters = new
                {
                    Accion = "UPDATE",
                    UserID,
                    Username = usuario.Username,
                    PasswordHash = passwordHash,
                    Rol = usuario.Rol
                };

                await _db.ExecuteAsync("sp_GuardarUsuario", parameters, commandType: CommandType.StoredProcedure);
                return Ok(new { message = $"✏️ Usuario {usuario.Username} actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return Problem($"❌ Error al actualizar usuario: {ex.Message}");
            }
        }

        // ============================================================
        // 🔹 Función interna para generar hash SHA-256
        // ============================================================
        private static byte[] HashSha256(string input)
        {
            using var sha = SHA256.Create();
            return sha.ComputeHash(Encoding.UTF8.GetBytes(input));
        }
    }
}