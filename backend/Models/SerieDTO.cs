namespace backend.Models
{
    public class SerieDTO
    {
        public string Accion { get; set; } = "ADD";  // 'ADD' o 'UPDATE'
        public int? SerieID { get; set; }            // Autonumérico (no se envía al crear)
        public string SeriesName { get; set; } = string.Empty;
        public string DocType { get; set; } = string.Empty;
        public int BranchID { get; set; }            // Relación con sucursal
    }
}