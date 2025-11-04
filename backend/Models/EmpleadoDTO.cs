namespace backend.Models
{
    public class EmpleadoDTO
    {
        public string Accion { get; set; } = "ADD";   // 'ADD' o 'UPDATE'
        public int? SlpCode { get; set; }             // NULL cuando se agrega
        public string SlpName { get; set; } = string.Empty;
        public string Position { get; set; } = string.Empty;
        public DateTime AdmissionDate { get; set; } = DateTime.Now;
        public int UserID { get; set; }               // FK a la tabla Usuarios
    }
}