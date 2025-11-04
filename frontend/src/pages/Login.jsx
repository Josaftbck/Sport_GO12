import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Petición al backend
      const res = await axios.post("http://localhost:5229/api/auth/login", form);
      const {
        success,
        message,
        token,
        username,
        rol,
        userID,     // ← SlpCode real del vendedor
        vendedor,   // ← Nombre completo del vendedor (SlpName)
      } = res.data;

      if (!success) {
        alert(message || "Credenciales inválidas");
        return;
      }

      // ✅ Guardar datos en localStorage
      localStorage.setItem("token_sportgo", token);
      localStorage.setItem("rol", rol);
      localStorage.setItem("username", username);
      localStorage.setItem("userID", userID);     // ← SlpCode real
      localStorage.setItem("vendedor", vendedor); // ← Nombre real del empleado

      // ✅ Redirigir según el rol
      switch (rol) {
        case "Administrador":
          navigate("/admin");
          break;
        case "Ventas":
          navigate("/ventas");
          break;
        case "Compras":
          navigate("/compras");
          break;
        case "Inventario":
          navigate("/articulos");
          break;
        case "Contabilidad":
          navigate("/contabilidad");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      alert(err.response?.data?.message || "⚠️ Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <div className="card shadow-sm p-4">
        <h3 className="text-center mb-4 fw-bold">🔐 Ingreso al ERP</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Usuario</label>
            <input
              type="text"
              className="form-control"
              name="username"
              onChange={handleChange}
              required
              placeholder="Ej: admin01"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              onChange={handleChange}
              required
              placeholder="•••••••"
            />
          </div>

          <button
            type="submit"
            className="btn btn-dark w-100"
            disabled={loading}
          >
            {loading ? "Verificando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;