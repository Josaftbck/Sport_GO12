using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System.Data;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// ==============================================
// 1️⃣ Configurar conexión SQL Server
// ==============================================
builder.Services.AddScoped<IDbConnection>(sp =>
{
    // Usa "Scoped" para que una misma conexión viva por toda la solicitud HTTP
    var connection = new SqlConnection(
        builder.Configuration.GetConnectionString("Sport_Go")
    );
    return connection;
});

// ==============================================
// 2️⃣ Registrar servicios necesarios
// ==============================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ==============================================
// 3️⃣ Habilitar CORS (para permitir React en localhost:5173)
// ==============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // 👈 tu frontend
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// ==============================================
// 4️⃣ Configuración del entorno de desarrollo
// ==============================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// ✅ IMPORTANTE: esto debe ir antes de MapControllers()
app.UseCors("AllowReactApp");

app.UseAuthorization();

// ✅ Mapea automáticamente todos los controladores
app.MapControllers();

app.Run();