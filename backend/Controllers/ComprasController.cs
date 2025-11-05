using Microsoft.AspNetCore.Mvc;
using Dapper;
using System.Data;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ComprasController : ControllerBase
    {
        private readonly IDbConnection _db;
        public ComprasController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 POST: /api/compras
        // Registra una nueva compra (encabezado + detalle)
        // Los triggers contables generan automáticamente los asientos.
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> RegistrarCompra([FromBody] CompraDTO compra)
        {
            try
            {
                if (_db.State == ConnectionState.Closed)
                    _db.Open();

                using var tran = _db.BeginTransaction();

                // 1️⃣ Validar que el proveedor exista
                var proveedorExiste = await _db.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM SociosNegocio WHERE CardCode = @CardCode AND CardType = 'S'",
                    new { compra.CardCode }, tran);

                if (proveedorExiste == 0)
                {
                    tran.Rollback();
                    return BadRequest(new { success = false, message = "❌ El proveedor no existe o no es de tipo 'S'." });
                }

                // 2️⃣ Validar que el empleado (comprador) exista
                var empExiste = await _db.ExecuteScalarAsync<int>(
                    "SELECT COUNT(1) FROM Empleados WHERE SlpCode = @SlpCode",
                    new { compra.SlpCode }, tran);

                if (empExiste == 0)
                {
                    tran.Rollback();
                    return BadRequest(new { success = false, message = "❌ El empleado (comprador) no existe." });
                }

                // 3️⃣ Insertar encabezado de compra
                var sqlEnc = @"
                    INSERT INTO ComprasEncabezado (DocDate, CardCode, DocTotal, SlpCode, SerieID)
                    VALUES (GETDATE(), @CardCode, @DocTotal, @SlpCode, @SerieID);
                    SELECT CAST(SCOPE_IDENTITY() AS INT);";

                decimal docTotal = compra.Detalle.Sum(x => x.Quantity * x.Price);
                int docNum = await _db.ExecuteScalarAsync<int>(sqlEnc, new
                {
                    compra.CardCode,
                    DocTotal = docTotal,
                    compra.SlpCode,
                    compra.SerieID
                }, tran);

                // 4️⃣ Insertar detalle de compra
                int line = 1;
                foreach (var d in compra.Detalle)
                {
                    await _db.ExecuteAsync(@"
                        INSERT INTO ComprasDetalle (DocNum, LineNum, ItemCode, Quantity, Tax, Price, GTotal)
                        VALUES (@DocNum, @LineNum, @ItemCode, @Quantity, @Tax, @Price, @GTotal);",
                        new
                        {
                            DocNum = docNum,
                            LineNum = line++,
                            d.ItemCode,
                            d.Quantity,
                            d.Tax,
                            d.Price,
                            GTotal = d.Quantity * d.Price
                        }, tran);
                }

                // 5️⃣ Confirmar transacción
                tran.Commit();

                return Ok(new
                {
                    success = true,
                    message = "✅ Compra registrada correctamente.",
                    docNum
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = $"⚠️ Error al registrar compra: {ex.Message}"
                });
            }
            finally
            {
                if (_db.State == ConnectionState.Open)
                    _db.Close();
            }
        }

        // ============================================================
        // 🔹 GET: /api/compras
        // Devuelve listado de compras con proveedor y empleado
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerCompras()
        {
            try
            {
                string sql = @"
                    SELECT 
                        C.DocNum,
                        C.DocDate,
                        S.CardName AS Proveedor,
                        E.SlpName AS Comprador,
                        C.DocTotal,
                        SE.SeriesName AS Serie
                    FROM ComprasEncabezado C
                    INNER JOIN SociosNegocio S ON C.CardCode = S.CardCode
                    INNER JOIN Empleados E ON C.SlpCode = E.SlpCode
                    INNER JOIN Series SE ON C.SerieID = SE.SerieID
                    ORDER BY C.DocNum DESC";

                var compras = await _db.QueryAsync(sql);
                return Ok(compras);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }
    }

    // ============================================================
    // 🔹 DTOs internos del controlador
    // (puedes moverlos a /DTOs/CompraDTO.cs si prefieres)
    // ============================================================
    public class CompraDTO
    {
        public string CardCode { get; set; } = string.Empty;
        public int SlpCode { get; set; }
        public int SerieID { get; set; }
        public List<CompraDetalleDTO> Detalle { get; set; } = new();
    }

    public class CompraDetalleDTO
    {
        public string ItemCode { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public int Tax { get; set; }
        public decimal Price { get; set; }
    }
}
