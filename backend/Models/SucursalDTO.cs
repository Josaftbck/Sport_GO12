public class SucursalDTO
{
    public string Accion { get; set; } = "ADD";
    public int? BranchID { get; set; }  // ← no obligatorio
    public string BranchName { get; set; } = string.Empty;
    public string BranchAddress { get; set; } = string.Empty;
}