import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Form, Container, Row, Col } from "react-bootstrap";

const Usuarios = () => {
  const API_URL = "http://localhost:5229/api/usuarios";

  const [usuarios, setUsuarios] = useState([]);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [form, setForm] = useState({
    Username: "",
    Password: "",
    Rol: "Ventas",
  });

  // ==========================================================
  // 🔹 1. Cargar usuarios desde backend
  // ==========================================================
  const obtenerUsuarios = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setUsuarios(data);
    } catch {
      toast.error("❌ Error al obtener usuarios");
    }
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  // ==========================================================
  // 🔹 2. Manejo de cambios en formulario
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // ==========================================================
  // 🔹 3. Limpiar formulario
  // ==========================================================
  const limpiar = () => {
    setForm({ Username: "", Password: "", Rol: "Ventas" });
    setModoEdicion(false);
    setIdEditando(null);
  };

  // ==========================================================
  // 🔹 4. Validar duplicados
  // ==========================================================
  const usuarioDuplicado = (nombre) => {
    return usuarios.some(
      (u) => u.Username.toLowerCase() === nombre.toLowerCase()
    );
  };

  // ==========================================================
  // 🔹 5. Guardar nuevo usuario
  // ==========================================================
  const guardar = async () => {
    try {
      if (!form.Username || !form.Password) {
        toast.warning("⚠️ Completa usuario y contraseña");
        return;
      }

      // Validar duplicado
      if (usuarioDuplicado(form.Username)) {
        toast.warning(`⚠️ El usuario "${form.Username}" ya existe`);
        return;
      }

      await axios.post(API_URL, {
        username: form.Username,
        password: form.Password,
        rol: form.Rol,
      });
      toast.success("✅ Usuario creado correctamente");
      limpiar();
      obtenerUsuarios();
    } catch (e) {
      console.error(e);
      toast.error("❌ Error al crear usuario");
    }
  };

  // ==========================================================
  // 🔹 6. Actualizar usuario existente
  // ==========================================================
  const actualizar = async () => {
    try {
      await axios.put(`${API_URL}/${idEditando}`, {
        username: form.Username,
        newPassword: form.Password || null, // si está vacío, no cambia
        rol: form.Rol,
      });
      toast.info("✏️ Usuario actualizado correctamente");
      limpiar();
      obtenerUsuarios();
    } catch {
      toast.error("❌ Error al actualizar usuario");
    }
  };

  // ==========================================================
  // 🔹 7. Editar usuario seleccionado
  // ==========================================================
  const editar = (u) => {
    setModoEdicion(true);
    setIdEditando(u.UserID);
    setForm({
      Username: u.Username,
      Password: "", // vacío por seguridad
      Rol: u.Rol || "Ventas",
    });
    toast.info(`✏️ Editando ${u.Username}`);
  };

  // ==========================================================
  // 🔹 8. Enviar formulario
  // ==========================================================
  const submit = (e) => {
    e.preventDefault();
    if (modoEdicion) actualizar();
    else guardar();
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
        style={{ marginTop: 70 }}
      />

      <h2 className="text-center mb-4 fw-bold">🔐 Gestión de Usuarios</h2>

      {/* Formulario */}
      <Form
        onSubmit={submit}
        className="p-3 border rounded bg-light shadow-sm mb-4"
      >
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                name="Username"
                value={form.Username}
                onChange={handleChange}
                placeholder="Ej: admin01"
                required
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>
                {modoEdicion
                  ? "Nueva contraseña (opcional)"
                  : "Contraseña"}
              </Form.Label>
              <Form.Control
                type="password"
                name="Password"
                value={form.Password}
                onChange={handleChange}
                placeholder={
                  modoEdicion
                    ? "Dejar en blanco para no cambiar"
                    : "********"
                }
                {...(modoEdicion ? {} : { required: true })}
              />
            </Form.Group>
          </Col>

          <Col md={4}>
            <Form.Group>
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="Rol"
                value={form.Rol}
                onChange={handleChange}
              >
                <option value="Administrador">Administrador</option>
                <option value="Ventas">Ventas</option>
                <option value="Compras">Compras</option>
                <option value="Logística">Logística</option>
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
          <Button variant="danger" onClick={limpiar}>
            Cancelar
          </Button>
        </div>
      </Form>

      {/* Tabla de usuarios */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark text-center">
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {usuarios.length ? (
            usuarios.map((u) => (
              <tr key={u.UserID}>
                <td>{u.UserID}</td>
                <td>{u.Username}</td>
                <td>
                  <span className="badge bg-secondary">{u.Rol}</span>
                </td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 text-dark fw-semibold"
                    onClick={() => editar(u)}
                  >
                    ✏️ Editar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-muted">
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Usuarios;