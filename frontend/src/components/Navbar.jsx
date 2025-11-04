import React from "react";
import { Navbar, Nav, Container, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate();

  // 📦 Datos del usuario logueado
  const username = localStorage.getItem("username") || "Usuario";
  const rol = localStorage.getItem("rol") || "Invitado";

  // 🔒 Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("token_sportgo");
    localStorage.removeItem("rol");
    localStorage.removeItem("username");
    localStorage.removeItem("branch");
    localStorage.removeItem("userID");
    navigate("/login");
  };

  // 🧭 Función de validación de permisos
  const puedeVer = (rolesPermitidos) =>
    rolesPermitidos.includes(rol) || rol === "Administrador";

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          SportGo ERP
        </Navbar.Brand>

        <Navbar.Toggle />
        <Navbar.Collapse>
          <Nav className="me-auto">
            {/* ======================================
                🔹 Módulos visibles según el rol
            ====================================== */}

            {puedeVer(["Ventas"]) && (
              <>
                <Nav.Link as={Link} to="/ventas">Ventas</Nav.Link>
                <Nav.Link as={Link} to="/socios">Socios</Nav.Link>
              </>
            )}

            {puedeVer(["Inventario"]) && (
              <Nav.Link as={Link} to="/articulos">Artículos</Nav.Link>
            )}

            {puedeVer(["Compras"]) && (
              <Nav.Link as={Link} to="/compras">Compras</Nav.Link>
            )}

            {puedeVer(["Contabilidad"]) && (
              <Nav.Link as={Link} to="/contabilidad">Contabilidad</Nav.Link>
            )}

            {puedeVer(["Administrador"]) && (
              <>
                <Nav.Link as={Link} to="/sucursales">Sucursales</Nav.Link>
                <Nav.Link as={Link} to="/series">Series</Nav.Link>
                <Nav.Link as={Link} to="/empleados">Empleados</Nav.Link>
                <Nav.Link as={Link} to="/usuarios">Usuarios</Nav.Link>
              </>
            )}
          </Nav>

          {/* ======================================
              🔹 Usuario y botón de logout
          ====================================== */}
          <div className="d-flex align-items-center">
            <span className="text-light me-3">
              👤 {username} ({rol})
            </span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleLogout}
              className="fw-semibold"
            >
              🔒 Cerrar sesión
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;