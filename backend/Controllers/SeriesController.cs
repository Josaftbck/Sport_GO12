using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SeriesController : ControllerBase
    {
        private readonly IDbConnection _db;
        public SeriesController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 GET: api/series → obtener todas las series
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerSeries()
        {
            var series = await _db.QueryAsync("SELECT * FROM Series ORDER BY SerieID");
            return Ok(series);
        }

        // ============================================================
        // 🔹 POST: api/series → registrar nueva serie
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> CrearSerie([FromBody] SerieDTO serie)
        {
            var parameters = new
            {
                Accion = "ADD",
                SerieID = 0, // No se usa realmente, pero el SP lo espera
                serie.SeriesName,
                serie.DocType,
                serie.BranchID
            };

            await _db.ExecuteAsync("sp_GuardarSerie", parameters, commandType: CommandType.StoredProcedure);
            return Ok(new { message = $"✅ Serie '{serie.SeriesName}' registrada correctamente." });
        }

        // ============================================================
        // 🔹 PUT: api/series/{id} → actualizar una serie existente
        // ============================================================
        [HttpPut("{id}")]
        public async Task<IActionResult> ActualizarSerie(int id, [FromBody] SerieDTO serie)
        {
            var parameters = new
            {
                Accion = "UPDATE",
                SerieID = id,
                serie.SeriesName,
                serie.DocType,
                serie.BranchID
            };

            await _db.ExecuteAsync("sp_GuardarSerie", parameters, commandType: CommandType.StoredProcedure);
            return Ok(new { message = $"✏️ Serie {id} actualizada correctamente." });
        }
    }
}