using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmpleadosController : ControllerBase
    {
        private readonly IDbConnection _db;
        public EmpleadosController(IDbConnection db) => _db = db;

        // ============================================================
        // 🔹 GET: Obtener todos los empleados
        // ============================================================
        [HttpGet]
        public async Task<IActionResult> ObtenerEmpleados()
        {
            var sql = "SELECT * FROM Empleados ORDER BY SlpCode";
            var data = await _db.QueryAsync(sql);
            return Ok(data);
        }

        // ============================================================
        // 🔹 POST: Registrar nuevo empleado
        // ============================================================
        [HttpPost]
        public async Task<IActionResult> RegistrarEmpleado([FromBody] EmpleadoDTO emp)
        {
            if (emp == null)
                return BadRequest("El objeto empleado no puede ser nulo.");

            var parameters = new
            {
                Accion = "ADD",
                SlpCode = emp.SlpCode ?? 0,  // 🔹 Lo agregamos (aunque sea null)
                emp.SlpName,
                emp.Position,
                emp.AdmissionDate,
                emp.UserID
            };

            await _db.ExecuteAsync("sp_GuardarEmpleado", parameters, commandType: CommandType.StoredProcedure);
            return Ok(new { message = $"✅ Empleado {emp.SlpName} registrado correctamente." });
        }
[HttpGet("usuario/{userId}")]
public async Task<IActionResult> ObtenerPorUsuario(int userId)
{
    var sql = "SELECT TOP 1 SlpCode, SlpName FROM Empleados WHERE UserID = @userId";
    var empleado = await _db.QueryFirstOrDefaultAsync(sql, new { userId });

    if (empleado == null)
        return NotFound(new { message = "No se encontró empleado para este usuario." });

    return Ok(empleado);
}   
        // ============================================================
        // 🔹 PUT: Actualizar datos de un empleado existente
        // ============================================================
        [HttpPut("{SlpCode}")]
        public async Task<IActionResult> ActualizarEmpleado(int SlpCode, [FromBody] EmpleadoDTO emp)
        {
            if (emp == null)
                return BadRequest("El objeto empleado no puede ser nulo.");

            var parameters = new
            {
                Accion = "UPDATE",
                SlpCode,
                emp.SlpName,
                emp.Position,
                emp.AdmissionDate,
                emp.UserID
            };

            await _db.ExecuteAsync("sp_GuardarEmpleado", parameters, commandType: CommandType.StoredProcedure);
            return Ok(new { message = $"✏️ Empleado {SlpCode} actualizado correctamente." });
        }
    }
}