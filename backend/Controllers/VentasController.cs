using Microsoft.AspNetCore.Mvc;
using Dapper;
using System.Data;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class VentasController : ControllerBase
    {
        private readonly IDbConnection _db;
        public VentasController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 POST: /api/ventas
        // Registra una nueva venta (encabezado + detalle)
        // Los triggers calculan totales, impuestos y contabilidad.
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> RegistrarVenta([FromBody] VentaDTO venta)
        {
            try
            {
                // =======================================================
                // 1️⃣ Asegurar que la conexión esté abierta
                // =======================================================
                if (_db.State == ConnectionState.Closed)
                    _db.Open();

                using var tran = _db.BeginTransaction();

                // =======================================================
                // 2️⃣ Validar que el socio de negocio exista
                // =======================================================
                var socioExiste = await _db.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM SociosNegocio WHERE CardCode = @CardCode",
                    new { venta.CardCode }, tran);

                if (socioExiste == 0)
                {
                    tran.Rollback();
                    return BadRequest(new { success = false, message = "❌ El socio de negocio no existe." });
                }

                // =======================================================
                // 3️⃣ Validar que el empleado (vendedor) exista
                // =======================================================
                var empExiste = await _db.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM Empleados WHERE SlpCode = @SlpCode",
                    new { venta.SlpCode }, tran);

                if (empExiste == 0)
                {
                    tran.Rollback();
                    return BadRequest(new { success = false, message = "❌ El empleado (vendedor) no existe." });
                }

                // =======================================================
                // 4️⃣ Insertar encabezado de venta
                // Los triggers posteriores se encargan de contabilidad
                // =======================================================
                var sqlEnc = @"
                    INSERT INTO VentasEncabezado (DocDate, CardCode, SplCode, SerieID)
                    VALUES (GETDATE(), @CardCode, @SplCode, @SerieID);
                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                int docNum = await _db.ExecuteScalarAsync<int>(sqlEnc, new
                {
                    venta.CardCode,
                    SplCode = venta.SlpCode,
                    venta.SerieID
                }, tran);

                // =======================================================
                // 5️⃣ Insertar líneas de detalle
                // Cada línea desencadena triggers de validación, stock y totales
                // =======================================================
                int line = 1;
                foreach (var d in venta.Detalle)
                {
                    await _db.ExecuteAsync(@"
                        INSERT INTO VentasDetalle (DocNum, LineNum, ItemCode, Quantity)
                        VALUES (@DocNum, @LineNum, @ItemCode, @Quantity);",
                        new
                        {
                            DocNum = docNum,
                            LineNum = line++,
                            d.ItemCode,
                            d.Quantity
                        }, tran);
                }

                // =======================================================
                // 6️⃣ Confirmar transacción
                // =======================================================
                tran.Commit();

                return Ok(new
                {
                    success = true,
                    message = "✅ Venta registrada correctamente.",
                    docNum
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"⚠️ Error al registrar venta: {ex.Message}"
                });
            }
            finally
            {
                // =======================================================
                // 7️⃣ Cerrar la conexión si está abierta
                // =======================================================
                if (_db.State == ConnectionState.Open)
                    _db.Close();
            }
        }

        // ============================================================
        // 🔹 GET: /api/ventas
        // Devuelve listado de ventas con cliente y vendedor
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerVentas()
        {
            try
            {
                string sql = @"
                    SELECT 
                        VE.DocNum,
                        VE.DocDate,
                        S.CardName,
                        E.SlpName,
                        VE.DocTotal,
                        SE.SeriesName AS SerieName
                    FROM VentasEncabezado VE
                    INNER JOIN SociosNegocio S ON VE.CardCode = S.CardCode
                    INNER JOIN Empleados E ON VE.SplCode = E.SlpCode
                    INNER JOIN Series SE ON VE.SerieID = SE.SerieID
                    ORDER BY VE.DocNum DESC";

                var ventas = await _db.QueryAsync(sql);
                return Ok(ventas);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }
}