using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SportGo.Models
{
    [Table("ComprasEncabezado")]
    public class CompraEncabezado
    {
        [Key]
        public int DocNum { get; set; }
        public DateTime DocDate { get; set; }
        public string CardCode { get; set; } = null!;
        public decimal DocTotal { get; set; }
        public int SlpCode { get; set; }
        public int SerieID { get; set; }

        public List<CompraDetalle> Detalle { get; set; } = new();
    }
}