using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ArticulosController : ControllerBase
    {
        private readonly IDbConnection _db;
        public ArticulosController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 1. OBTENER ARTÍCULOS (con filtro de estado)
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerArticulos([FromQuery] string? estado = "activos")
        {
            string sql = estado?.ToLower() switch
            {
                "inactivos" => "SELECT * FROM Articulos WHERE Active = 0 ORDER BY ItemCode",
                "todos" => "SELECT * FROM Articulos ORDER BY ItemCode",
                _ => "SELECT * FROM Articulos WHERE Active = 1 ORDER BY ItemCode"
            };

            var articulos = await _db.QueryAsync(sql);
            return Ok(articulos);
        }

        // ============================================================
        // 🔹 2. GUARDAR NUEVO ARTÍCULO
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> GuardarArticulo([FromBody] ArticuloDTO articulo)
        {
            var sql = @"
                INSERT INTO Articulos (ItemCode, ItemName, Price, MaxLevel, Active)
                VALUES (@ItemCode, @ItemName, @Price, @MaxLevel, 1)";
            
            await _db.ExecuteAsync(sql, articulo);
            return Ok(new { message = $"✅ Artículo {articulo.ItemName} guardado correctamente." });
        }

        // ============================================================
        // 🔹 3. ACTUALIZAR ARTÍCULO
        // ============================================================
        [HttpPut("{ItemCode}")]
        public async Task<IActionResult> ActualizarArticulo(string ItemCode, [FromBody] ArticuloDTO articulo)
        {
            var sql = @"
                UPDATE Articulos
                SET ItemName = @ItemName,
                    Price = @Price,
                    MaxLevel = @MaxLevel
                WHERE ItemCode = @ItemCode";

            var filas = await _db.ExecuteAsync(sql, new
            {
                articulo.ItemName,
                articulo.Price,
                articulo.MaxLevel,
                ItemCode
            });

            if (filas == 0)
                return NotFound(new { message = $"⚠️ No se encontró el artículo {ItemCode}" });

            return Ok(new { message = $"✏️ Artículo {ItemCode} actualizado correctamente." });
        }

        // ============================================================
        // 🔹 4. ELIMINADO LÓGICO (Active = 0)
        // ============================================================
        [HttpDelete("{ItemCode}")]
        public async Task<IActionResult> EliminarArticulo(string ItemCode)
        {
            var sql = "UPDATE Articulos SET Active = 0 WHERE ItemCode = @ItemCode";
            var filas = await _db.ExecuteAsync(sql, new { ItemCode });

            if (filas == 0)
                return NotFound(new { message = $"⚠️ No se encontró el artículo {ItemCode}" });

            return Ok(new { message = $"🗑️ Artículo {ItemCode} desactivado correctamente." });
        }

        // ============================================================
        // 🔹 5. REACTIVAR (Active = 1)
        // ============================================================
        [HttpPatch("{ItemCode}/estado/{activo}")]
        public async Task<IActionResult> CambiarEstado(string ItemCode, bool activo)
        {
            var sql = "UPDATE Articulos SET Active = @activo WHERE ItemCode = @ItemCode";
            var filas = await _db.ExecuteAsync(sql, new { ItemCode, activo });

            if (filas == 0)
                return NotFound(new { message = $"⚠️ No se encontró el artículo {ItemCode}" });

            string estado = activo ? "activado" : "desactivado";
            return Ok(new { message = $"🔄 Artículo {ItemCode} {estado} correctamente." });
        }
    }
}