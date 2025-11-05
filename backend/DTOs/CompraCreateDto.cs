public class CompraDetalleDto
{
    public string ItemCode { get; set; } = null!;
    public int Quantity { get; set; }
    public int Tax { get; set; }
    public decimal Price { get; set; }
}

public class CompraCreateDto
{
    public DateTime DocDate { get; set; }
    public string CardCode { get; set; } = null!;
    public int SlpCode { get; set; }
    public int SerieID { get; set; }
    public List<CompraDetalleDto> Detalle { get; set; } = new();
}
