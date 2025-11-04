namespace backend.Models
{
    public class VentaDTO
    {
        public string CardCode { get; set; } = string.Empty;  // Cliente
        public int SlpCode { get; set; }                      // Vendedor (Empleado)
        public int SerieID { get; set; }                      // Serie del documento
        public List<VentaDetalleDTO> Detalle { get; set; } = new(); // Detalle de productos
    }

    public class VentaDetalleDTO
    {
        public string ItemCode { get; set; } = string.Empty;  // Código del artículo
        public int Quantity { get; set; }                     // Cantidad vendida
    }
}