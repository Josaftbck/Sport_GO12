using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SucursalesController : ControllerBase
    {
        private readonly IDbConnection _db;
        public SucursalesController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 GET: Obtener todas las sucursales
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerSucursales()
        {
            var sql = "SELECT * FROM Sucursales ORDER BY BranchID";
            var data = await _db.QueryAsync(sql);
            return Ok(data);
        }

        // ============================================================
        // 🔹 POST: Registrar nueva sucursal (IDENTITY automático)
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> RegistrarSucursal([FromBody] SucursalDTO sucursal)
        {
            var sql = @"
                INSERT INTO Sucursales (BranchName, BranchAddress)
                VALUES (@BranchName, @BranchAddress)";

            await _db.ExecuteAsync(sql, sucursal);
            return Ok(new { message = $"✅ Sucursal '{sucursal.BranchName}' registrada correctamente." });
        }

        // ============================================================
        // 🔹 PUT: Actualizar datos de una sucursal
        // ============================================================
        [HttpPut("{BranchID}")]
        public async Task<IActionResult> ActualizarSucursal(int BranchID, [FromBody] SucursalDTO sucursal)
        {
            var sql = @"
                UPDATE Sucursales
                SET BranchName = @BranchName,
                    BranchAddress = @BranchAddress
                WHERE BranchID = @BranchID";

            int filas = await _db.ExecuteAsync(sql, new
            {
                sucursal.BranchName,
                sucursal.BranchAddress,
                BranchID
            });

            if (filas == 0)
                return NotFound(new { message = $"⚠️ No se encontró la sucursal con ID {BranchID}" });

            return Ok(new { message = $"✏️ Sucursal {BranchID} actualizada correctamente." });
        }
    }
}