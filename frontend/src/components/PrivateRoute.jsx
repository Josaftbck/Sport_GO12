import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem("token_sportgo");
  const rol = localStorage.getItem("rol");

  // 🔒 Si no hay token → redirigir al login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 👑 El administrador tiene acceso a todo
  if (rol === "Administrador") {
    return <Outlet />;
  }

  // 🔍 Verificar si el rol actual está en los roles permitidos
  if (!allowedRoles.includes(rol)) {
    return (
      <div className="container mt-5 text-center">
        <h3 className="text-danger fw-bold">🚫 Acceso denegado</h3>
        <p>No tienes permisos para ingresar a este módulo.</p>
      </div>
    );
  }

  // ✅ Si pasa las validaciones, renderiza el contenido
  return <Outlet />;
};

export default PrivateRoute;