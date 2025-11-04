import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Form, Container, Row, Col } from "react-bootstrap";

const Sucursales = () => {
  const [sucursales, setSucursales] = useState([]);
  const [form, setForm] = useState({
    BranchName: "",
    BranchAddress: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState(null);

  const API_URL = "http://localhost:5229/api/sucursales";

  // ==========================================================
  // 🔹 1. Obtener todas las sucursales
  // ==========================================================
  const obtenerSucursales = async () => {
    try {
      const res = await axios.get(API_URL);
      setSucursales(res.data);
    } catch {
      toast.error("❌ Error al obtener sucursales");
    }
  };

  useEffect(() => {
    obtenerSucursales();
  }, []);

  // ==========================================================
  // 🔹 2. Manejo del formulario
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const limpiarFormulario = () => {
    setForm({ BranchName: "", BranchAddress: "" });
    setModoEdicion(false);
    setCodigoEditando(null);
  };

  // ==========================================================
  // 🔹 3. Guardar nueva sucursal
  // ==========================================================
  const guardarSucursal = async () => {
    try {
      await axios.post(API_URL, form);
      toast.success("✅ Sucursal guardada correctamente");
      limpiarFormulario();
      obtenerSucursales();
    } catch {
      toast.error("❌ Error al guardar sucursal");
    }
  };

  // ==========================================================
  // 🔹 4. Actualizar sucursal existente
  // ==========================================================
  const actualizarSucursal = async () => {
    try {
      await axios.put(`${API_URL}/${codigoEditando}`, form);
      toast.info("✏️ Sucursal actualizada correctamente");
      limpiarFormulario();
      obtenerSucursales();
    } catch {
      toast.error("❌ Error al actualizar sucursal");
    }
  };

  // ==========================================================
  // 🔹 5. Cargar datos para edición
  // ==========================================================
  const editarSucursal = (sucursal) => {
    setForm({
      BranchName: sucursal.BranchName,
      BranchAddress: sucursal.BranchAddress,
    });
    setCodigoEditando(sucursal.BranchID);
    setModoEdicion(true);
    toast.info(`✏️ Editando sucursal ${sucursal.BranchName}`);
  };

  // ==========================================================
  // 🔹 6. Enviar formulario
  // ==========================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) actualizarSucursal();
    else guardarSucursal();
  };

  // ==========================================================
  // 🔹 7. Renderizado visual
  // ==========================================================
  return (
    <Container className="mt-4">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
        style={{ marginTop: "70px" }}
      />
      <h2 className="text-center mb-4 fw-bold">🏢 Gestión de Sucursales</h2>

      {/* 🔹 Formulario */}
      <Form
        onSubmit={handleSubmit}
        className="p-3 border rounded bg-light shadow-sm mb-4"
      >
        {modoEdicion && (
          <Form.Group className="mb-3">
            <Form.Label>ID</Form.Label>
            <Form.Control
              type="text"
              value={codigoEditando}
              readOnly
              className="bg-secondary text-white fw-bold"
            />
          </Form.Group>
        )}

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="BranchName"
                value={form.BranchName}
                onChange={handleChange}
                placeholder="Nombre de la sucursal"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="BranchAddress"
                value={form.BranchAddress}
                onChange={handleChange}
                placeholder="Dirección de la sucursal"
                required
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
            <th>ID</th>
            <th>Nombre</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {sucursales.length > 0 ? (
            sucursales.map((s) => (
              <tr key={s.BranchID}>
                <td>{s.BranchID}</td>
                <td>{s.BranchName}</td>
                <td>{s.BranchAddress}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 text-dark fw-semibold"
                    onClick={() => editarSucursal(s)}
                  >
                    ✏️ Editar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center text-muted">
                No hay sucursales registradas
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Sucursales;