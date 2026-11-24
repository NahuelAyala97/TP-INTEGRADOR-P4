import { Route, Routes } from "react-router-dom";

import { LoginPage, RegisterPage, AdminUsuariosPage } from "@/features/auth";
import { CategoriasPage } from "@/features/categories";
import { ProductoPage } from "@/features/products";

import CatalogoPage from "@/features/catalog/pages/CatalogoPage";
import CarritoPage from "@/features/cart/pages/CarritoPage";
import CheckoutPage from "@/features/orders/pages/CheckoutPage";
import UnauthorizedPage from "@/shared/components/UnauthorizedPage";
import MisPedidosPage from "@/features/orders/pages/MisPedidosPage";
import AdminPedidosPage from "@/features/orders/pages/AdminPedidosPage";
import AdminResumenPage from "@/features/orders/pages/AdminResumenPage";

import ProtectedRoute from "./ProtectedRoute";

export function AppRouter() {
  return (
    <Routes>
      {/* Rutas publicas */}
      <Route path="/" element={<CatalogoPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      {/* Carrito de compras */}
      <Route path="/carrito" element={<CarritoPage />} />

      {/* Rutas que requieren iniciar sesion */}
      <Route element={<ProtectedRoute />}>
        <Route path="/categorias" element={<CategoriasPage />} />
        <Route path="/productos" element={<ProductoPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["user"]} />}>
        <Route path="/mis-pedidos" element={<MisPedidosPage />} />
      </Route>

      {/* Rutas exclusivas del administrador */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin/usuarios" element={<AdminUsuariosPage />} />
        <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
        <Route path="/admin/categorias" element={<CategoriasPage />} />
        <Route path="/admin/productos" element={<ProductoPage />} />
        <Route path="/admin/resumen" element={<AdminResumenPage />} />
      </Route>
    </Routes>
  );
}
