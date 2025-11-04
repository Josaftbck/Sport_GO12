namespace backend.Models
{
    public class UsuarioDTO
    {
        public int? UserID { get; set; }           // opcional al crear
        public string Username { get; set; } = string.Empty;

        // 🔹 Esta propiedad es obligatoria (texto plano al crear/actualizar)
        public string Password { get; set; } = string.Empty;

        public string Rol { get; set; } = string.Empty;
    }
}