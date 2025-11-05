using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SportGo.Models
{
    [Table("ComprasDetalle")]
    public class CompraDetalle
    {
        [Key, Column(Order = 0)]
        public int DocNum { get; set; }

        [Key, Column(Order = 1)]
        public int LineNum { get; set; }

        public string ItemCode { get; set; } = null!;
        public int Quantity { get; set; }
        public int Tax { get; set; }
        public decimal Price { get; set; }
        public decimal GTotal { get; set; }

        [ForeignKey("DocNum")]
        public CompraEncabezado Encabezado { get; set; } = null!;
    }
}
