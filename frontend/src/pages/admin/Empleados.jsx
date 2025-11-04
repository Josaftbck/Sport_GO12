import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Form, Container, Row, Col } from "react-bootstrap";

const Empleados = () => {
  const [empleados, setEmpleados] = useState([]);
  const [usuarios, setUsuarios] = useState([]); // 👈 nueva lista de usuarios
  const [form, setForm] = useState({
    SlpCode: "",
    SlpName: "",
    Position: "",
    AdmissionDate: "",
    UserID: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState("");

  const API_URL = "http://localhost:5229/api";

  // ==========================================================
  // 🔹 1. Obtener empleados y usuarios
  // ==========================================================
  const obtenerEmpleados = async () => {
    try {
      const res = await axios.get(`${API_URL}/empleados`);
      setEmpleados(res.data);
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al obtener empleados");
    }
  };

  const obtenerUsuarios = async () => {
    try {
      const res = await axios.get(`${API_URL}/usuarios`);
      setUsuarios(res.data);
    } catch (error) {
      console.error(error);
      toast.error("⚠️ Error al obtener usuarios");
    }
  };

  useEffect(() => {
    obtenerEmpleados();
    obtenerUsuarios();
  }, []);

  // ==========================================================
  // 🔹 2. Manejar cambios en el formulario
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const limpiarFormulario = () => {
    setForm({
      SlpCode: "",
      SlpName: "",
      Position: "",
      AdmissionDate: "",
      UserID: "",
    });
    setModoEdicion(false);
    setCodigoEditando("");
  };

  // ==========================================================
  // 🔹 3. Guardar nuevo empleado
  // ==========================================================
  const guardarEmpleado = async () => {
    try {
      if (!form.SlpName || !form.Position || !form.UserID) {
        toast.warning("⚠️ Completa todos los campos obligatorios");
        return;
      }

      const nuevoEmpleado = {
        accion: "ADD",
        slpCode: null,
        slpName: form.SlpName,
        position: form.Position,
        admissionDate: form.AdmissionDate,
        userID: parseInt(form.UserID),
      };

      await axios.post(`${API_URL}/empleados`, nuevoEmpleado);
      toast.success("✅ Empleado guardado correctamente");
      limpiarFormulario();
      obtenerEmpleados();
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al guardar empleado");
    }
  };

  // ==========================================================
  // 🔹 4. Actualizar empleado existente
  // ==========================================================
  const actualizarEmpleado = async () => {
    try {
      const empleadoActualizado = {
        accion: "UPDATE",
        slpCode: parseInt(codigoEditando),
        slpName: form.SlpName,
        position: form.Position,
        admissionDate: form.AdmissionDate,
        userID: parseInt(form.UserID),
      };

      await axios.put(`${API_URL}/empleados/${codigoEditando}`, empleadoActualizado);
      toast.info("✏️ Empleado actualizado correctamente");
      limpiarFormulario();
      obtenerEmpleados();
    } catch (error) {
      console.error(error);
      toast.error("❌ Error al actualizar empleado");
    }
  };

  // ==========================================================
  // 🔹 5. Editar empleado seleccionado
  // ==========================================================
  const editarEmpleado = (empleado) => {
    setForm({
      SlpCode: empleado.SlpCode,
      SlpName: empleado.SlpName,
      Position: empleado.Position,
      AdmissionDate: empleado.AdmissionDate?.split("T")[0],
      UserID: empleado.UserID,
    });
    setModoEdicion(true);
    setCodigoEditando(empleado.SlpCode);
  };

  // ==========================================================
  // 🔹 6. Manejar envío del formulario
  // ==========================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) actualizarEmpleado();
    else guardarEmpleado();
  };

  // ==========================================================
  // 🔹 7. Renderizado visual
  // ==========================================================
  return (
    <Container className="mt-4">
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
      <h2 className="text-center mb-4 fw-bold">👨‍💼 Gestión de Empleados</h2>

      {/* 🔹 Formulario */}
      <Form onSubmit={handleSubmit} className="p-3 border rounded bg-light shadow-sm mb-4">
        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre del Empleado</Form.Label>
              <Form.Control
                type="text"
                name="SlpName"
                value={form.SlpName}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Puesto</Form.Label>
              <Form.Control
                type="text"
                name="Position"
                value={form.Position}
                onChange={handleChange}
                placeholder="Ej: Vendedor, Cajero..."
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Fecha de Ingreso</Form.Label>
              <Form.Control
                type="date"
                name="AdmissionDate"
                value={form.AdmissionDate}
                onChange={handleChange}
                required
              />
            </Form.Group>
          </Col>

          <Col md={6}>
            <Form.Group>
              <Form.Label>Usuario del Sistema</Form.Label>
              <Form.Select
                name="UserID"
                value={form.UserID}
                onChange={handleChange}
                required
              >
                <option value="">Seleccione un usuario</option>
                {usuarios.map((u) => (
                  <option key={u.UserID} value={u.UserID}>
                    {u.Username} ({u.Rol})
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
            <th>Código</th>
            <th>Nombre</th>
            <th>Puesto</th>
            <th>Fecha de Ingreso</th>
            <th>Usuario del Sistema</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {empleados.length > 0 ? (
            empleados.map((emp) => (
              <tr key={emp.SlpCode}>
                <td>{emp.SlpCode}</td>
                <td>{emp.SlpName}</td>
                <td>{emp.Position}</td>
                <td>{emp.AdmissionDate?.split("T")[0]}</td>
                <td>
                  {usuarios.find((u) => u.UserID === emp.UserID)?.Username ||
                    "No asignado"}
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 text-dark fw-semibold"
                    onClick={() => editarEmpleado(emp)}
                  >
                    ✏️ Editar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No hay empleados registrados
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Empleados;