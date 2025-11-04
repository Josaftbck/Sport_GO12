import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Form, Container, Row, Col } from "react-bootstrap";

const Series = () => {
  const [series, setSeries] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState({
    SeriesName: "",
    DocType: "",
    BranchID: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState(null);

  const API_URL = "http://localhost:5229/api/series";
  const API_SUCURSALES = "http://localhost:5229/api/sucursales";

  // ==========================================================
  // 🔹 Cargar series y sucursales
  // ==========================================================
  const obtenerSeries = async () => {
    try {
      const res = await axios.get(API_URL);
      setSeries(res.data);
    } catch {
      toast.error("❌ Error al obtener series");
    }
  };

  const obtenerSucursales = async () => {
    try {
      const res = await axios.get(API_SUCURSALES);
      setSucursales(res.data);
    } catch {
      toast.error("❌ Error al obtener sucursales");
    }
  };

  useEffect(() => {
    obtenerSeries();
    obtenerSucursales();
  }, []);

  // ==========================================================
  // 🔹 Manejo de formulario
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const limpiarFormulario = () => {
    setForm({ SeriesName: "", DocType: "", BranchID: "" });
    setModoEdicion(false);
    setCodigoEditando(null);
  };

  // ==========================================================
  // 🔹 Guardar / Actualizar
  // ==========================================================
  const guardarSerie = async () => {
    try {
      await axios.post(API_URL, form);
      toast.success("✅ Serie guardada correctamente");
      limpiarFormulario();
      obtenerSeries();
    } catch {
      toast.error("❌ Error al guardar serie");
    }
  };

  const actualizarSerie = async () => {
    try {
      await axios.put(`${API_URL}/${codigoEditando}`, form);
      toast.info("✏️ Serie actualizada correctamente");
      limpiarFormulario();
      obtenerSeries();
    } catch {
      toast.error("❌ Error al actualizar serie");
    }
  };

  const editarSerie = (serie) => {
    setForm({
      SeriesName: serie.SeriesName,
      DocType: serie.DocType,
      BranchID: serie.BranchID,
    });
    setCodigoEditando(serie.SerieID);
    setModoEdicion(true);
    toast.info(`✏️ Editando serie ${serie.SeriesName}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) actualizarSerie();
    else guardarSerie();
  };

  // ==========================================================
  // 🔹 Renderizado visual
  // ==========================================================
  return (
    <Container className="mt-4">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      <h2 className="text-center mb-4 fw-bold">🔢 Gestión de Series</h2>

      {/* 🔹 Formulario */}
      <Form
        onSubmit={handleSubmit}
        className="p-3 border rounded bg-light shadow-sm mb-4"
      >
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Nombre de Serie</Form.Label>
              <Form.Control
                type="text"
                name="SeriesName"
                value={form.SeriesName}
                onChange={handleChange}
                placeholder="Ej: F001"
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Tipo de Documento</Form.Label>
              <Form.Control
                type="text"
                name="DocType"
                value={form.DocType}
                onChange={handleChange}
                placeholder="Ej: Factura"
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Sucursal</Form.Label>
              <Form.Select
                name="BranchID"
                value={form.BranchID}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione una sucursal</option>
                {sucursales.map((s) => (
                  <option key={s.BranchID} value={s.BranchID}>
                    {s.BranchName}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end">
          <Button
            variant={modoEdicion ? "warning" : "primary"}
            type="submit"
            className="me-2 text-dark fw-semibold"
          >
            {modoEdicion ? "Actualizar" : "Guardar"}
          </Button>
          <Button variant="danger" onClick={limpiarFormulario}>
            Cancelar
          </Button>
        </div>
      </Form>

      {/* 🔹 Tabla */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark text-center">
          <tr>
            <th>ID</th>
            <th>Serie</th>
            <th>Tipo Documento</th>
            <th>Sucursal</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {series.length > 0 ? (
            series.map((s) => (
              <tr key={s.SerieID}>
                <td>{s.SerieID}</td>
                <td>{s.SeriesName}</td>
                <td>{s.DocType}</td>
                <td>{s.BranchID}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 text-dark fw-semibold"
                    onClick={() => editarSerie(s)}
                  >
                    ✏️ Editar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No hay series registradas
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Series;