import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:5229/api";

const Compras = () => {
  // ========================
  // 🔹 Estados principales
  // ========================
  const [proveedores, setProveedores] = useState([]);
  const [articulos, setArticulos] = useState([]);
  const [series, setSeries] = useState([]);
  const [compras, setCompras] = useState([]);
  const [detalle, setDetalle] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    CardCode: "",
    SlpCode: parseInt(localStorage.getItem("userID")) || 0, // ID del empleado comprador
    SerieID: "",
  });

  const [nuevoItem, setNuevoItem] = useState({
    ItemCode: "",
    Quantity: 1,
    Price: 0,
    Tax: 12,
  });

  // Comprador (nombre desde localStorage)
  const compradorNombre = localStorage.getItem("vendedor") || "Sin nombre";

  // ========================
  // 🔹 Cargar datos iniciales
  // ========================
  useEffect(() => {
    obtenerProveedores();
    obtenerSeries();
    obtenerArticulos();
    obtenerCompras();
  }, []);

  const obtenerProveedores = async () => {
    try {
      const res = await axios.get(`${API_URL}/socios`);
      const proveedoresFiltrados = res.data.filter(
        (s) => s.CardType === "S" // Solo proveedores
      );
      setProveedores(proveedoresFiltrados);
    } catch {
      toast.error("⚠️ Error al cargar los proveedores.");
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

  const obtenerCompras = async () => {
    try {
      const res = await axios.get(`${API_URL}/compras`);
      setCompras(res.data);
    } catch {
      toast.error("⚠️ Error al cargar las compras.");
    }
  };

  // ========================
  // 🔹 Lógica del detalle
  // ========================
  const agregarLinea = () => {
    if (!nuevoItem.ItemCode) return toast.warning("Seleccione un artículo.");
    if (nuevoItem.Quantity <= 0) return toast.warning("Cantidad inválida.");
    if (nuevoItem.Price <= 0) return toast.warning("Ingrese un precio válido.");

    setDetalle([...detalle, { ...nuevoItem }]);
    setNuevoItem({ ItemCode: "", Quantity: 1, Price: 0, Tax: 12 });
  };

  const eliminarLinea = (idx) => {
    setDetalle(detalle.filter((_, i) => i !== idx));
  };

  // ========================
  // 🔹 Registrar compra
  // ========================
  const registrarCompra = async () => {
    if (!form.CardCode) return toast.warning("Seleccione un proveedor.");
    if (!form.SerieID) return toast.warning("Seleccione una serie.");
    if (detalle.length === 0)
      return toast.warning("Debe agregar al menos un artículo.");

    setLoading(true);
    try {
      const payload = { ...form, Detalle: detalle };
      const res = await axios.post(`${API_URL}/compras`, payload);

      if (res.data.success) {
        toast.success(res.data.message);
        setDetalle([]);
        setForm({
          CardCode: "",
          SlpCode: parseInt(localStorage.getItem("userID")) || 0,
          SerieID: "",
        });
        obtenerCompras();
      } else {
        toast.error(res.data.message || "❌ Error en el registro.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "⚠️ Error al registrar compra.");
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
      <h3 className="fw-bold mb-3">🧾 Registrar Compra</h3>

      <div className="card p-4 mb-4 shadow-sm">
        <div className="row g-3">
          {/* Proveedor */}
          <div className="col-md-4">
            <label className="form-label">Proveedor</label>
            <select
              className="form-select"
              value={form.CardCode}
              onChange={(e) => setForm({ ...form, CardCode: e.target.value })}
            >
              <option value="">Seleccione proveedor</option>
              {proveedores.map((p) => (
                <option key={p.CardCode} value={p.CardCode}>
                  {p.CardCode} - {p.CardName}
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

          {/* Comprador */}
          <div className="col-md-4">
            <label className="form-label">Comprador</label>
            <input
              type="text"
              className="form-control"
              value={compradorNombre}
              readOnly
            />
          </div>
        </div>

        {/* Detalle de artículos */}
        <div className="row g-3 mt-4">
          <div className="col-md-4">
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
              min="1"
              value={nuevoItem.Quantity}
              onChange={(e) =>
                setNuevoItem({
                  ...nuevoItem,
                  Quantity: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Precio (Q)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={nuevoItem.Price}
              onChange={(e) =>
                setNuevoItem({
                  ...nuevoItem,
                  Price: parseFloat(e.target.value),
                })
              }
            />
          </div>

          <div className="col-md-2">
            <label className="form-label">Impuesto (%)</label>
            <input
              type="number"
              className="form-control"
              value={nuevoItem.Tax}
              onChange={(e) =>
                setNuevoItem({
                  ...nuevoItem,
                  Tax: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="col-md-1 d-flex align-items-end">
            <button
              className="btn btn-dark w-100"
              onClick={agregarLinea}
              disabled={!nuevoItem.ItemCode}
            >
              ➕
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
                <th>Precio (Q)</th>
                <th>Impuesto (%)</th>
                <th>Subtotal (Q)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {detalle.map((d, idx) => (
                <tr key={idx}>
                  <td>{d.ItemCode}</td>
                  <td>{d.Quantity}</td>
                  <td>{d.Price.toFixed(2)}</td>
                  <td>{d.Tax}</td>
                  <td>{(d.Quantity * d.Price).toFixed(2)}</td>
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
            onClick={registrarCompra}
            disabled={loading}
          >
            {loading ? "Registrando..." : "💾 Registrar Compra"}
          </button>
        </div>
      </div>

      {/* Tabla de compras */}
      <h4 className="fw-bold mt-5 mb-3">📋 Compras Registradas</h4>
      <table className="table table-bordered">
        <thead className="table-dark">
          <tr>
            <th>No. Doc</th>
            <th>Fecha</th>
            <th>Proveedor</th>
            <th>Comprador</th>
            <th>Total (Q)</th>
            <th>Serie</th>
          </tr>
        </thead>
        <tbody>
          {compras.map((c) => (
            <tr key={c.DocNum}>
              <td>{c.DocNum}</td>
              <td>{new Date(c.DocDate).toLocaleDateString()}</td>
              <td>{c.Proveedor}</td>
              <td>{c.Comprador}</td>
              <td>Q{c.DocTotal}</td>
              <td>{c.Serie}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Compras;
