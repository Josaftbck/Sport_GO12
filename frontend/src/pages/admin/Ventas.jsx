import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5229/api";

const Ventas = () => {
  // ========================
  // 🔹 Estados principales
  // ========================
  const [socios, setSocios] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [series, setSeries] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    CardCode: "",
    SlpCode: parseInt(localStorage.getItem("userID")) || 0, // ← SlpCode real
    SerieID: "",
  });

  const [nuevoItem, setNuevoItem] = useState({
    ItemCode: "",
    Quantity: 1,
  });

  // Vendedor (nombre desde el localStorage)
  const vendedorNombre = localStorage.getItem("vendedor") || "Sin nombre";

  // ========================
  // 🔹 Cargar datos iniciales
  // ========================
  useEffect(() => {
    obtenerSocios();
    obtenerSeries();
    obtenerArticulos();
    obtenerVentas();
  }, []);

  const obtenerSocios = async () => {
    try {
      const res = await axios.get(`${API_URL}/socios`);
      setSocios(res.data);
    } catch {
      toast.error("⚠️ Error al cargar los socios de negocio.");
    }
  };

  const obtenerSeries = async () => {
    try {
      const res = await axios.get(`${API_URL}/series`);
      setSeries(res.data);
    } catch {
      toast.error("⚠️ Error al cargar las series.");
    }
  };

  const obtenerArticulos = async () => {
    try {
      const res = await axios.get(`${API_URL}/articulos`);
      setArticulos(res.data);
    } catch {
      toast.error("⚠️ Error al cargar los artículos.");
    }
  };

  const obtenerVentas = async () => {
    try {
      const res = await axios.get(`${API_URL}/ventas`);
      setVentas(res.data);
    } catch {
      toast.error("⚠️ Error al cargar las ventas.");
    }
  };

  // ========================
  // 🔹 Lógica del detalle
  // ========================
  const agregarLinea = () => {
    if (!nuevoItem.ItemCode) return toast.warning("Seleccione un artículo.");
    if (nuevoItem.Quantity <= 0) return toast.warning("Cantidad inválida.");

    setDetalle([...detalle, { ...nuevoItem }]);
    setNuevoItem({ ItemCode: "", Quantity: 1 });
  };

  const eliminarLinea = (idx) => {
    setDetalle(detalle.filter((_, i) => i !== idx));
  };

  // ========================
  // 🔹 Registrar venta
  // ========================
  const registrarVenta = async () => {
    if (!form.CardCode) return toast.warning("Seleccione un cliente.");
    if (!form.SerieID) return toast.warning("Seleccione una serie.");
    if (detalle.length === 0)
      return toast.warning("Debe agregar al menos un artículo.");

    setLoading(true);
    try {
      const payload = { ...form, Detalle: detalle };
      const res = await axios.post(`${API_URL}/ventas`, payload);

      if (res.data.success) {
        toast.success(res.data.message);
        setDetalle([]);
        setForm({
          CardCode: "",
          SlpCode: parseInt(localStorage.getItem("userID")) || 0,
          SerieID: "",
        });
        obtenerVentas();
      } else {
        toast.error(res.data.message || "❌ Error en el registro.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "⚠️ Error al registrar venta.");
    } finally {
      setLoading(false);
    }
  };

  // ========================
  // 🔹 Renderizado JSX
  // ========================
  return (
    <div className="container mt-4">
      <ToastContainer position="bottom-right" autoClose={2500} />
      <h3 className="fw-bold mb-3">🧾 Registrar Venta</h3>

      <div className="card p-4 mb-4 shadow-sm">
        <div className="row g-3">
          {/* Cliente */}
          <div className="col-md-4">
            <label className="form-label">Cliente</label>
            <select
              className="form-select"
              value={form.CardCode}
              onChange={(e) => setForm({ ...form, CardCode: e.target.value })}
            >
              <option value="">Seleccione cliente</option>
              {socios.map((s) => (
                <option key={s.CardCode} value={s.CardCode}>
                  {s.CardCode} - {s.CardName}
                </option>
              ))}
            </select>
          </div>

          {/* Serie */}
          <div className="col-md-4">
            <label className="form-label">Serie</label>
            <select
              className="form-select"
              value={form.SerieID}
              onChange={(e) =>
                setForm({ ...form, SerieID: parseInt(e.target.value) })
              }
            >
              <option value="">Seleccione serie</option>
              {series.map((serie) => (
                <option key={serie.SerieID} value={serie.SerieID}>
                  {serie.SeriesName}
                </option>
              ))}
            </select>
          </div>

          {/* Vendedor */}
          <div className="col-md-4">
            <label className="form-label">Vendedor</label>
            <input
              type="text"
              className="form-control"
              value={vendedorNombre}
              readOnly
            />
          </div>
        </div>

        {/* Detalle de artículos */}
        <div className="row g-3 mt-4">
          <div className="col-md-6">
            <label className="form-label">Artículo</label>
            <select
              className="form-select"
              value={nuevoItem.ItemCode}
              onChange={(e) =>
                setNuevoItem({ ...nuevoItem, ItemCode: e.target.value })
              }
            >
              <option value="">Seleccione artículo</option>
              {articulos.map((a) => (
                <option key={a.ItemCode} value={a.ItemCode}>
                  {a.ItemCode} - {a.ItemName}
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              className="form-control"
              value={nuevoItem.Quantity}
              min="1"
              onChange={(e) =>
                setNuevoItem({
                  ...nuevoItem,
                  Quantity: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="col-md-2 d-flex align-items-end">
            <button
              className="btn btn-dark w-100"
              onClick={agregarLinea}
              disabled={!nuevoItem.ItemCode}
            >
              ➕ Agregar
            </button>
          </div>
        </div>

        {/* Tabla de detalle temporal */}
        {detalle.length > 0 && (
          <table className="table table-sm mt-4">
            <thead>
              <tr>
                <th>Artículo</th>
                <th>Cantidad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.ItemCode}</td>
                  <td>{d.Quantity}</td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => eliminarLinea(idx)}
                    >
                      ✖
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="text-end mt-3">
          <button
            className="btn btn-success"
            onClick={registrarVenta}
            disabled={loading}
          >
            {loading ? "Registrando..." : "💾 Registrar Venta"}
          </button>
        </div>
      </div>

      {/* Tabla de ventas */}
      <h4 className="fw-bold mt-5 mb-3">📋 Ventas Registradas</h4>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>No. Doc</th>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Total</th>
            <th>Serie</th>
          </tr>
        </thead>
        <tbody>
          {ventas.map((v) => (
            <tr key={v.DocNum}>
              <td>{v.DocNum}</td>
              <td>{new Date(v.DocDate).toLocaleDateString()}</td>
              <td>{v.CardName}</td>
              <td>{v.SlpName}</td>
              <td>Q{v.DocTotal}</td>
              <td>{v.SerieName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Ventas;