import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Table, Button, Form, Container, Row, Col } from "react-bootstrap";

const Socios = () => {
  const [socios, setSocios] = useState([]);
  const [form, setForm] = useState({
    CardCode: "",
    CardName: "",
    CardType: "C", // Por defecto cliente
    Phone1: "",
    Email: "",
    CardAddress: "",
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [codigoEditando, setCodigoEditando] = useState("");

  const API_URL = "http://localhost:5229/api/socios";

  // ==========================================================
  // 🔹 1. Cargar socios desde backend
  // ==========================================================
  const obtenerSocios = async () => {
    try {
      const res = await axios.get(API_URL);
      setSocios(res.data);
    } catch {
      toast.error("❌ Error al obtener socios.");
    }
  };

  useEffect(() => {
    obtenerSocios();
  }, []);

  // ==========================================================
  // 🔹 2. Manejo de formulario
  // ==========================================================
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si cambia el tipo, ajustamos el prefijo (C o P)
    if (name === "CardType") {
      const prefijo = value === "C" ? "C" : "P";
      const nitSinPrefijo = form.CardCode.replace(/[A-Z]/g, ""); // quitamos letras previas
      setForm({ ...form, CardType: value, CardCode: `${prefijo}${nitSinPrefijo}` });
    }
    // Si escribe el NIT, agregamos automáticamente la letra según el tipo
    else if (name === "CardCode") {
      const prefijo = form.CardType === "C" ? "C" : "P";
      const nitSolo = value.replace(/\D/g, ""); // solo números
      setForm({ ...form, CardCode: `${prefijo}${nitSolo}` });
    }
    else {
      setForm({ ...form, [name]: value });
    }
  };

  const limpiarFormulario = () => {
    setForm({
      CardCode: "",
      CardName: "",
      CardType: "C",
      Phone1: "",
      Email: "",
      CardAddress: "",
    });
    setModoEdicion(false);
    setCodigoEditando("");
  };

  // ==========================================================
  // 🔹 3. Verificar si el socio ya existe
  // ==========================================================
  const socioDuplicado = (codigo) => {
    return socios.some((s) => s.CardCode.toUpperCase() === codigo.toUpperCase());
  };

  // ==========================================================
  // 🔹 4. Guardar nuevo socio (con validación)
  // ==========================================================
  const guardarSocio = async () => {
    try {
      if (!form.CardCode || !form.CardName) {
        toast.warning("⚠️ Complete todos los campos obligatorios.");
        return;
      }

      // Validar duplicado
      if (socioDuplicado(form.CardCode)) {
        toast.warning(`⚠️ El código ${form.CardCode} ya está registrado.`);
        return;
      }

      await axios.post(API_URL, form);
      toast.success(`✅ Socio ${form.CardCode} guardado correctamente.`);
      limpiarFormulario();
      obtenerSocios();
    } catch (err) {
      console.error(err);
      toast.error("❌ Error al guardar socio.");
    }
  };

  // ==========================================================
  // 🔹 5. Actualizar socio existente
  // ==========================================================
  const actualizarSocio = async () => {
    try {
      await axios.put(`${API_URL}/${codigoEditando}`, form);
      toast.info("✏️ Socio actualizado correctamente.");
      limpiarFormulario();
      obtenerSocios();
    } catch {
      toast.error("❌ Error al actualizar socio.");
    }
  };

  // ==========================================================
  // 🔹 6. Editar socio seleccionado
  // ==========================================================
  const editarSocio = (s) => {
    setForm({
      CardCode: s.CardCode,
      CardName: s.CardName,
      CardType: s.CardType,
      Phone1: s.Phone1,
      Email: s.Email,
      CardAddress: s.CardAddress,
    });
    setCodigoEditando(s.CardCode);
    setModoEdicion(true);
    toast.info(`✏️ Editando socio ${s.CardName}`);
  };

  // ==========================================================
  // 🔹 7. Enviar formulario
  // ==========================================================
  const handleSubmit = (e) => {
    e.preventDefault();
    if (modoEdicion) actualizarSocio();
    else guardarSocio();
  };

  // ==========================================================
  // 🔹 8. Renderizado visual
  // ==========================================================
  return (
    <Container className="mt-4">
      <ToastContainer
        position="top-right"
        autoClose={2500}
        theme="colored"
        style={{ marginTop: "70px" }}
      />

      <h2 className="text-center mb-4 fw-bold">👥 Gestión de Socios de Negocio</h2>

      {/* 🔹 Formulario */}
      <Form
        onSubmit={handleSubmit}
        className="p-3 border rounded bg-light shadow-sm mb-4"
      >
        <Row className="mb-3">
          <Col md={4}>
            <Form.Group>
              <Form.Label>Tipo de Socio</Form.Label>
              <Form.Select
                name="CardType"
                value={form.CardType}
                onChange={handleChange}
                disabled={modoEdicion}
              >
                <option value="C">Cliente</option>
                <option value="P">Proveedor</option>
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={8}>
            <Form.Group>
              <Form.Label>NIT</Form.Label>
              <Form.Control
                type="text"
                name="CardCode"
                value={form.CardCode}
                onChange={handleChange}
                placeholder="Ej: 3413523 (el sistema añadirá C o P automáticamente)"
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="CardName"
                value={form.CardName}
                onChange={handleChange}
                placeholder="Nombre del socio"
                required
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Teléfono</Form.Label>
              <Form.Control
                type="text"
                name="Phone1"
                value={form.Phone1}
                onChange={handleChange}
                placeholder="Ej: 5555-1234"
              />
            </Form.Group>
          </Col>

          <Col md={3}>
            <Form.Group>
              <Form.Label>Correo Electrónico</Form.Label>
              <Form.Control
                type="email"
                name="Email"
                value={form.Email}
                onChange={handleChange}
                placeholder="ejemplo@email.com"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col>
            <Form.Group>
              <Form.Label>Dirección</Form.Label>
              <Form.Control
                type="text"
                name="CardAddress"
                value={form.CardAddress}
                onChange={handleChange}
                placeholder="Dirección del socio"
              />
            </Form.Group>
          </Col>
        </Row>

        <div className="text-end mt-3">
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

      {/* 🔹 Tabla de socios */}
      <Table striped bordered hover responsive className="shadow-sm">
        <thead className="table-dark text-center">
          <tr>
            <th>NIT</th>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Teléfono</th>
            <th>Correo</th>
            <th>Dirección</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody className="align-middle text-center">
          {socios.length > 0 ? (
            socios.map((s) => (
              <tr key={s.CardCode}>
                <td>{s.CardCode}</td>
                <td>{s.CardName}</td>
                <td>{s.CardType === "C" ? "Cliente" : "Proveedor"}</td>
                <td>{s.Phone1}</td>
                <td>{s.Email}</td>
                <td>{s.CardAddress}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2 text-dark fw-semibold"
                    onClick={() => editarSocio(s)}
                  >
                    ✏️ Editar
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" className="text-center text-muted">
                No hay socios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default Socios;