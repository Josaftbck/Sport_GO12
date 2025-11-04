using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Collections;

namespace backend.Utils
{
    public static class AuthTools
    {
        // 🔹 Hash de contraseña
        public static byte[] HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            return sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        }

        // 🔹 Verificación de contraseña
        public static bool VerifyPassword(string inputPassword, byte[] storedHash)
        {
            using var sha256 = SHA256.Create();
            var inputHash = sha256.ComputeHash(Encoding.UTF8.GetBytes(inputPassword));
            return StructuralComparisons.StructuralEqualityComparer.Equals(inputHash, storedHash);
        }

        // 🔹 Generar token JWT
        public static string GenerateToken(int userId, string username, string role)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SportGoERP_ClaveUltraSegura_2025_BACKEND"));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim("UserID", userId.ToString()),
                new Claim(ClaimTypes.Name, username),
                new Claim(ClaimTypes.Role, role)
            };

            var token = new JwtSecurityToken(
                issuer: "SportGoERP",
                audience: "SportGoERPUsers",
                claims: claims,
                expires: DateTime.Now.AddHours(8),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}