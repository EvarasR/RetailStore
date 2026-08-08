import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteForSession } from '../utils/authUtils';
import { AccountDashboardPage } from '../pages/account/AccountDashboardPage';
import { ProfilePage } from '../pages/account/ProfilePage';
import { AddressesPage } from '../pages/account/AddressesPage';
import { OrdersPage } from '../pages/account/OrdersPage';
import { OrderDetailPage } from '../pages/account/OrderDetailPage';
import { TrackingPage } from '../pages/account/TrackingPage';
import { WishlistPage } from '../pages/account/WishlistPage';
import { NotificationsPage } from '../pages/account/NotificationsPage';
import { SupportPage } from '../pages/account/SupportPage';
import { MembershipPage } from '../pages/account/MembershipPage';
import { SecurityPage } from '../pages/account/SecurityPage';
import { InvoicesPage } from '../pages/account/InvoicesPage';
import { RecurringPurchasesPage } from '../pages/account/RecurringPurchasesPage';
import { PreferencesPage } from '../pages/account/PreferencesPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '../pages/admin/AdminProductsPage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from '../pages/admin/AdminInventoryPage';
import { AdminSuppliersPage } from '../pages/admin/AdminSuppliersPage';
import { AdminProcurementPage } from '../pages/admin/AdminProcurementPage';
import { AdminCouponsPage } from '../pages/admin/AdminCouponsPage';
import { AdminPromotionsPage } from '../pages/admin/AdminPromotionsPage';
import { AdminPaymentsPage } from '../pages/admin/AdminPaymentsPage';
import { AdminTrackingPage } from '../pages/admin/AdminTrackingPage';
import { AdminPrimePage } from '../pages/admin/AdminPrimePage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminControlPage } from '../pages/admin/AdminControlPage';
import { AdminEmailsPage } from '../pages/admin/AdminEmailsPage';

// Importaciones Operativas FASE 7.1
import { WarehouseDashboardPage } from '../pages/warehouse/WarehouseDashboardPage';
import { WarehouseInventoryPage } from '../pages/warehouse/WarehouseInventoryPage';
import { WarehouseLotsPage } from '../pages/warehouse/WarehouseLotsPage';
import { WarehouseAlertsPage } from '../pages/warehouse/WarehouseAlertsPage';
import { WarehouseOrdersPage } from '../pages/warehouse/WarehouseOrdersPage';

import { SupplierManagerDashboardPage } from '../pages/supplierManager/SupplierManagerDashboardPage';
import { SupplierManagerSuppliersPage } from '../pages/supplierManager/SupplierManagerSuppliersPage';
import { SupplierManagerProcurementPage } from '../pages/supplierManager/SupplierManagerProcurementPage';
import { SupplierManagerProductsPage } from '../pages/supplierManager/SupplierManagerProductsPage';
import { SupplierManagerMissingPage } from '../pages/supplierManager/SupplierManagerMissingPage';

import { SupportDashboardPage } from '../pages/support/SupportDashboardPage';
import { SupportTicketsPage } from '../pages/support/SupportTicketsPage';
import { SupportIncidentsPage } from '../pages/support/SupportIncidentsPage';
import { SupportOrdersPage } from '../pages/support/SupportOrdersPage';

import { ProviderDashboardPage } from '../pages/provider/ProviderDashboardPage';
import { ProviderProductsPage } from '../pages/provider/ProviderProductsPage';
import { ProviderOrdersPage } from '../pages/provider/ProviderOrdersPage';
import { ProviderHistoryPage } from '../pages/provider/ProviderHistoryPage';

const DynamicPanelRedirect = () => {
  const { autenticado, loading, ...session } = useAuth();
  if (loading) return null;
  if (!autenticado) return <Navigate to="/login" replace />;
  return <Navigate to={getDefaultRouteForSession(session)} replace />;
};

const DynamicProveedorRedirect = () => {
  const { autenticado, loading, es_proveedor_externo } = useAuth();
  if (loading) return null;
  if (!autenticado) return <Navigate to="/login" replace />;
  if (es_proveedor_externo) return <Navigate to="/proveedor/dashboard" replace />;
  return <Navigate to="/403" replace />;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/" element={<HomePage />} />
      <Route path="/catalogo" element={<CatalogPage />} />
      <Route path="/producto/:id" element={<ProductDetailPage />} />
      <Route path="/carrito" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />

      {/* Rutas corporativas de cuenta FASE 5.1 en React */}
      <Route
        path="/cuenta"
        element={
          <ProtectedRoute>
            <AccountDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/perfil"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/direcciones"
        element={
          <ProtectedRoute>
            <AddressesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/pedidos"
        element={
          <ProtectedRoute>
            <OrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/pedidos/:id"
        element={
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/tracking/:id"
        element={
          <ProtectedRoute>
            <TrackingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/wishlist"
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/notificaciones"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/soporte"
        element={
          <ProtectedRoute>
            <SupportPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/membresia"
        element={
          <ProtectedRoute>
            <MembershipPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cuenta/seguridad"
        element={
          <ProtectedRoute>
            <SecurityPage />
          </ProtectedRoute>
        }
      />
      <Route path="/cuenta/facturas" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
      <Route path="/cuenta/recurrentes" element={<ProtectedRoute><RecurringPurchasesPage /></ProtectedRoute>} />
      <Route path="/cuenta/preferencias" element={<ProtectedRoute><PreferencesPage /></ProtectedRoute>} />

      {/* =====================================================================
          FASE 6.1 — PANEL DE ADMINISTRACIÓN ENTERPRISE EN REACT
          Protegidas por RoleRoute (ADMIN).
          ===================================================================== */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route
        path="/admin/dashboard"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/productos"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminProductsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/categorias"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminCategoriesPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/pedidos"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminOrdersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/inventario"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminInventoryPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/proveedores"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminSuppliersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/abastecimiento"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminProcurementPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/cupones"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminCouponsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/descuentos"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminPromotionsPage />
          </RoleRoute>
        }
      />
      <Route path="/admin/promociones" element={<Navigate to="/admin/descuentos" replace />} />
      <Route
        path="/admin/pagos"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminPaymentsPage />
          </RoleRoute>
        }
      />
      <Route path="/admin/emails" element={<RoleRoute requiredRole="ADMIN"><AdminEmailsPage /></RoleRoute>} />
      <Route
        path="/admin/tracking"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminTrackingPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/prime"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminPrimePage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/reportes"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminReportsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/admin/control"
        element={
          <RoleRoute requiredRole="ADMIN">
            <AdminControlPage />
          </RoleRoute>
        }
      />

      {/* RUTAS OPERATIVAS FASE 7.1 — WAREHOUSE MANAGER */}
      <Route
        path="/warehouse"
        element={
          <RoleRoute requiredRole="WAREHOUSE_MANAGER">
            <WarehouseDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/warehouse/dashboard"
        element={
          <RoleRoute requiredRole="WAREHOUSE_MANAGER">
            <WarehouseDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/warehouse/inventario"
        element={
          <RoleRoute requiredRole="WAREHOUSE_MANAGER">
            <WarehouseInventoryPage />
          </RoleRoute>
        }
      />
      <Route
        path="/warehouse/lotes"
        element={
          <RoleRoute requiredRole="WAREHOUSE_MANAGER">
            <WarehouseLotsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/warehouse/alertas"
        element={
          <RoleRoute requiredRole="WAREHOUSE_MANAGER">
            <WarehouseAlertsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/warehouse/pedidos"
        element={
          <RoleRoute requiredRole="WAREHOUSE_MANAGER">
            <WarehouseOrdersPage />
          </RoleRoute>
        }
      />

      {/* RUTAS OPERATIVAS FASE 7.1 — SUPPLIER MANAGER */}
      <Route
        path="/supplier-manager"
        element={
          <RoleRoute requiredRole="SUPPLIER_MANAGER">
            <SupplierManagerDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier-manager/dashboard"
        element={
          <RoleRoute requiredRole="SUPPLIER_MANAGER">
            <SupplierManagerDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier-manager/proveedores"
        element={
          <RoleRoute requiredRole="SUPPLIER_MANAGER">
            <SupplierManagerSuppliersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier-manager/abastecimiento"
        element={
          <RoleRoute requiredRole="SUPPLIER_MANAGER">
            <SupplierManagerProcurementPage />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier-manager/productos"
        element={
          <RoleRoute requiredRole="SUPPLIER_MANAGER">
            <SupplierManagerProductsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/supplier-manager/faltantes"
        element={
          <RoleRoute requiredRole="SUPPLIER_MANAGER">
            <SupplierManagerMissingPage />
          </RoleRoute>
        }
      />

      {/* RUTAS OPERATIVAS FASE 7.1 — SUPPORT INTERNAL */}
      <Route
        path="/support"
        element={
          <RoleRoute requiredRole="SUPPORT">
            <SupportDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/support/dashboard"
        element={
          <RoleRoute requiredRole="SUPPORT">
            <SupportDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/support/tickets"
        element={
          <RoleRoute requiredRole="SUPPORT">
            <SupportTicketsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/support/incidencias"
        element={
          <RoleRoute requiredRole="SUPPORT">
            <SupportIncidentsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/support/pedidos"
        element={
          <RoleRoute requiredRole="SUPPORT">
            <SupportOrdersPage />
          </RoleRoute>
        }
      />

      {/* RUTAS OPERATIVAS FASE 7.1 — PORTAL PROVEEDOR EXTERNO */}
      <Route
        path="/proveedor"
        element={
          <RoleRoute requireExternalProvider={true}>
            <ProviderDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/proveedor/dashboard"
        element={
          <RoleRoute requireExternalProvider={true}>
            <ProviderDashboardPage />
          </RoleRoute>
        }
      />
      <Route
        path="/proveedor/productos"
        element={
          <RoleRoute requireExternalProvider={true}>
            <ProviderProductsPage />
          </RoleRoute>
        }
      />
      <Route
        path="/proveedor/ordenes"
        element={
          <RoleRoute requireExternalProvider={true}>
            <ProviderOrdersPage />
          </RoleRoute>
        }
      />
      <Route
        path="/proveedor/historial"
        element={
          <RoleRoute requireExternalProvider={true}>
            <ProviderHistoryPage />
          </RoleRoute>
        }
      />

      {/* Redirecciones de rutas legacy */}
      <Route path="/perfil" element={<Navigate to="/cuenta/perfil" replace />} />
      <Route path="/pedidos" element={<Navigate to="/cuenta/pedidos" replace />} />
      <Route path="/panel" element={<DynamicPanelRedirect />} />
      <Route path="/proveedores" element={<DynamicProveedorRedirect />} />

      {/* Fallback de ruta no encontrada */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
