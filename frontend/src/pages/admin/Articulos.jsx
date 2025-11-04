import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Form, Container, Row, Col } from "react-bootstrap";

const Articulos = () => {
  const [articulos, setArticulos] = useState([]);
  const [form, setForm] = useState({
    ItemCode: "",
    ItemName: "",
    Price: "",
    MaxLevel: "",
    Active: true,
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState("");
  const [filtro, setFiltro] = useState("activos"); // 👈 nuevo estado de filtro

  const API_URL = "http://localhost:5229/api/articulos";

  // ==========================================================
  // 🔹 1. Cargar artículos (según filtro)
  // ==========================================================
  const obtenerArticulos = async () => {
    try {
      const res = await axios.get(`${API_URL}?estado=${filtro}`);
      setArticulos(res.data);
    } catch (error) {
      toast.error("❌ Error al obtener artículos");
    }
  };

  useEffect(() => {
    obtenerArticulos();
  }, [filtro]); // 👈 cambia al seleccionar otro filtro

  // ==========================================================
  // 🔹 2. Manejo de formulario
  // ==========================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const limpiarFormulario = () => {
    setForm({
      ItemCode: "",
      ItemName: "",
      Price: "",
      MaxLevel: "",
      Active: true,
    });
    setModoEdicion(false);
    setCodigoEditando("");
  };

  // ==========================================================
  // 🔹 3. Guardar nuevo artículo
  // ==========================================================
  const guardarArticulo = async () => {
    try {
      await axios.post(API_URL, form);
      toast.success("✅ Artículo guardado correctamente");
      limpiarFormulario();
      obtenerArticulos();
    } catch (error) {
      toast.error("❌ Error al guardar artículo");
    }
  };

  // ==========================================================
  // 🔹 4. Actualizar artículo
  // ==========================================================
  const actualizarArticulo = async () => {
    try {
      await axios.put(`${API_URL}/${codigoEditando}`, form);
      toast.info("✏️ Artículo actualizado correctamente");
      limpiarFormulario();
      obtenerArticulos();
    } catch (error) {
      toast.error("❌ Error al actualizar artículo");
    }
  };

  // ==========================================================
  // 🔹 5. Eliminar (lógico)
  // ==========================================================
  const eliminarArticulo = async (ItemCode) => {
    if (window.confirm("¿Seguro que deseas desactivar este artículo?")) {
      try {
        const res = await axios.delete(`${API_URL}/${ItemCode}`);
        toast.warning(res.data.message || "🗑️ Artículo desactivado correctamente");
        obtenerArticulos();
      } catch (error) {
        toast.error("❌ Error al eliminar artículo");
      }
    }
  };

  // ==========================================================
  // 🔹 6. Reactivar artículo
  // ==========================================================
  const activarArticulo = async (ItemCode) => {
    try {
      const res = await axios.patch(`${API_URL}/${ItemCode}/estado/true`);
      toast.success(res.data.message || "✅ Artículo reactivado correctamente");
      obtenerArticulos();
    } catch (error) {
      toast.error("❌ Error al reactivar artículo");
    }
  };

  // ==========================================================
  // 🔹 7. Editar
  // ==========================================================
  const editarArticulo = (articulo) => {
    setForm({
      ItemCode: articulo.ItemCode,
      ItemName: articulo.ItemName,
      Price: articulo.Price,
      MaxLevel: articulo.MaxLevel,
      Active: articulo.Active,
    });
    setModoEdicion(true);
    setCodigoEditando(articulo.ItemCode);
    toast.info(`✏️ Editando artículo ${articulo.ItemName}`);
  };

  // ==========================================================
  // 🔹 8. Enviar formulario
  // ==========================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) actualizarArticulo();
    else guardarArticulo();
  };

  // ==========================================================
  // 🔹 9. Renderizado visual
  // ==========================================================
  return (
    <Container className="mt-4">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
        style={{ marginTop: "70px" }}
      />

      <h2 className="text-center mb-4 fw-bold">📦 Gestión de Artículos</h2>

      {/* 🔹 Filtro */}
      <div className="d-flex justify-content-end mb-3">
        <Form.Select
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          style={{ width: "200px" }}
        >
          <option value="activos">Activos</option>
          <option value="inactivos">Inactivos</option>
          <option value="todos">Todos</option>
        </Form.Select>
      </div>

      {/* 🔹 Formulario */}
      <Form
        onSubmit={handleSubmit}
        className="p-3 border rounded bg-light shadow-sm mb-4"
      >
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Código</Form.Label>
              <Form.Control
                type="text"
                name="ItemCode"
                value={form.ItemCode}
                onChange={handleChange}
                placeholder="Ej: A001"
                disabled={modoEdicion}
                required
              />
            </Form.Group>
          </Col>

          <Col md={8}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="ItemName"
                value={form.ItemName}
                onChange={handleChange}
                placeholder="Nombre del artículo"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Precio (Q)</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="Price"
                value={form.Price}
                onChange={handleChange}
                placeholder="0.00"
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Stock Máximo</Form.Label>
              <Form.Control
                type="number"
                name="MaxLevel"
                value={form.MaxLevel}
                onChange={handleChange}
                placeholder="Ej: 100"
              />
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
            <th>Código</th>
            <th>Nombre</th>
            <th>Precio (Q)</th>
            <th>Stock Máximo</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {articulos.length > 0 ? (
            articulos.map((a) => (
              <tr key={a.ItemCode}>
                <td>{a.ItemCode}</td>
                <td>{a.ItemName}</td>
                <td>Q {parseFloat(a.Price).toFixed(2)}</td>
                <td>{a.MaxLevel}</td>
                <td>
                  {a.Active ? (
                    <span className="badge bg-success">Activo</span>
                  ) : (
                    <span className="badge bg-secondary">Inactivo</span>
                  )}
                </td>
                <td>
                  {a.Active ? (
                    <>
                      <Button
                        variant="warning"
                        size="sm"
                        className="me-2 text-dark fw-semibold"
                        onClick={() => editarArticulo(a)}
                      >
                        ✏️ Editar
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => eliminarArticulo(a.ItemCode)}
                      >
                        🗑️ Eliminar
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => activarArticulo(a.ItemCode)}
                    >
                      🔄 Activar
                    </Button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No hay artículos registrados
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Articulos;