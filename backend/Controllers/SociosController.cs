using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SociosController : ControllerBase
    {
        private readonly IDbConnection _db;
        public SociosController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 GET: api/socios
        //     Obtiene todos los socios de negocio
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerSocios()
        {
            try
            {
                var socios = await _db.QueryAsync("SELECT * FROM SociosNegocio ORDER BY CardCode");
                return Ok(socios);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = $"❌ Error al obtener socios: {ex.Message}" });
            }
        }

        // ============================================================
        // 🔹 POST: api/socios
        //     Crea un nuevo socio de negocio (Accion = 'ADD')
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> CrearSocio([FromBody] SocioNegocioDTO socio)
        {
            try
            {
                var parameters = new
                {
                    Accion = "ADD",
                    socio.CardCode,
                    socio.CardName,
                    socio.CardType,
                    socio.Phone1,
                    socio.Email,
                    socio.CardAddress
                };

                await _db.ExecuteAsync("sp_GuardarSocioNegocio", parameters, commandType: CommandType.StoredProcedure);

                return Ok(new { message = $"✅ Socio '{socio.CardName}' creado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"❌ Error al crear socio: {ex.Message}" });
            }
        }

        // ============================================================
        // 🔹 PUT: api/socios/{CardCode}
        //     Actualiza los datos de un socio existente (Accion = 'UPDATE')
        // ============================================================
        [HttpPut("{CardCode}")]
        public async Task<IActionResult> ActualizarSocio(string CardCode, [FromBody] SocioNegocioDTO socio)
        {
            try
            {
                var parameters = new
                {
                    Accion = "UPDATE",
                    CardCode,
                    socio.CardName,
                    socio.CardType,
                    socio.Phone1,
                    socio.Email,
                    socio.CardAddress
                };

                int filas = await _db.ExecuteAsync("sp_GuardarSocioNegocio", parameters, commandType: CommandType.StoredProcedure);

                if (filas == 0)
                    return NotFound(new { message = $"⚠️ No se encontró el socio {CardCode}" });

                return Ok(new { message = $"✏️ Socio '{CardCode}' actualizado correctamente." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"❌ Error al actualizar socio: {ex.Message}" });
            }
        }
    }
}