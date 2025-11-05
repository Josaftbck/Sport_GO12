import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// 🔐 Vista de login
import Login from "./pages/Login";

// 🧩 Módulos ERP (todo está en /admin)
import Socios from "./pages/admin/Socios";
import Articulos from "./pages/admin/Articulos";
import Sucursales from "./pages/admin/Sucursales";
import Series from "./pages/admin/Series";
import Empleados from "./pages/admin/Empleados";
import Usuarios from "./pages/admin/Usuarios";
import Ventas from "./pages/admin/Ventas"; // 👈 Nuevo módulo de ventas
import Compras from "./pages/admin/Compras"; // 👈 Nuevo módulo de ventas

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================
           🔹 LOGIN (sin Navbar)
        ============================================ */}
        <Route path="/login" element={<Login />} />

        {/* ============================================
           🔹 ÁREA PROTEGIDA (ERP con Navbar)
           Controlada por PrivateRoute
        ============================================ */}
        <Route
          element={
            <PrivateRoute
              allowedRoles={[
                "Administrador",
                "Ventas",
                "Compras",
                "Inventario",
                "Contabilidad",
              ]}
            />
          }
        >
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  {/* ============================================
                     🔸 ADMINISTRACIÓN GENERAL
                  ============================================ */}
                  <Route path="/usuarios" element={<Usuarios />} />
                  <Route path="/empleados" element={<Empleados />} />
                  <Route path="/sucursales" element={<Sucursales />} />
                  <Route path="/series" element={<Series />} />
                  <Route path="/compras" element={<Compras />} />

                  {/* ============================================
                     🔸 VENTAS
                  ============================================ */}
                  <Route path="/ventas" element={<Ventas />} />

                  {/* ============================================
                     🔸 SOCIOS DE NEGOCIO
                  ============================================ */}
                  <Route path="/socios" element={<Socios />} />

                  {/* ============================================
                     🔸 INVENTARIO
                  ============================================ */}
                  <Route path="/articulos" element={<Articulos />} />

                  {/* ============================================
                     🔸 PÁGINA POR DEFECTO
                  ============================================ */}
                  <Route
                    path="*"
                    element={
                      <div className="container mt-5 text-center">
                        <h3 className="text-muted">🏠 Bienvenido a SportGo ERP</h3>
                        <p>Selecciona un módulo del menú para comenzar.</p>
                      </div>
                    }
                  />
                </Routes>
              </>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;