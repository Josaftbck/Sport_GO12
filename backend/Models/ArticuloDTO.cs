namespace backend.Models
{
    public class ArticuloDTO
    {
        public string Accion { get; set; } = "ADD";   // 'ADD' o 'UPDATE'
        public string ItemCode { get; set; } = string.Empty;
        public string ItemName { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public int MaxLevel { get; set; }
        public bool Active { get; set; } = true;
    }
}