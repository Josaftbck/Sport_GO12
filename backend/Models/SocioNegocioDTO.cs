namespace backend.Models
{
    public class SocioNegocioDTO
    {
        public string Accion { get; set; } = "ADD";  // 'ADD' o 'UPDATE'
        public string CardCode { get; set; } = string.Empty;
        public string CardName { get; set; } = string.Empty;
        public string CardType { get; set; } = "C";  // C = Cliente, S = Proveedor
        public string Phone1 { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CardAddress { get; set; } = string.Empty;
    }
}