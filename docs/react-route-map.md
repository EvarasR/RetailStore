# Mapa de Rutas React

| Ruta | Actual/Propuesta | Componente | Archivo | Layout | Guard | Roles permitidos | Comportamiento actual | Endpoint principal | Dependencia Django | Estado | Acción final |
|---|---|---|---|---|---|---|---|---|---|---|---|
| `/` | Actual | HomePage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/catalogo` | Actual | CatalogPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/producto/:id` | Actual | ProductDetailPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/carrito` | Actual | CartPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/checkout` | Actual | CheckoutPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/login` | Actual | LoginPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/registro` | Actual | RegisterPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/perfil` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/direcciones` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/pedidos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/pedidos/:id` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/tracking/:id` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/wishlist` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/notificaciones` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/soporte` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/membresia` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/cuenta/seguridad` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin` | Actual | Navigate to="/admin/dashboard" replace / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/dashboard` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/productos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/pedidos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/inventario` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/proveedores` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/abastecimiento` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/cupones` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/promociones` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/pagos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/tracking` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/prime` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/reportes` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/admin/control` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/warehouse` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/warehouse/dashboard` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/warehouse/inventario` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/warehouse/lotes` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/warehouse/alertas` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/warehouse/pedidos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/supplier-manager` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/supplier-manager/dashboard` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/supplier-manager/proveedores` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/supplier-manager/abastecimiento` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/supplier-manager/productos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/supplier-manager/faltantes` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/support` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/support/dashboard` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/support/tickets` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/support/incidencias` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/support/pedidos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedor` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedor/dashboard` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedor/productos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedor/ordenes` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedor/historial` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/perfil` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/pedidos` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/panel` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedores` | Actual | Unknown | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `*` | Actual | CatalogPage / | frontend/src/routes/AppRouter.tsx | MainLayout | AuthGuard | User | Funciona | `/api/` | N/A | ACTIVO | Mantener |
| `/proveedores` | Legacy | DjangoFallback | N/A | Ninguno | None | PROVEEDOR | Navegación dura a backend Django | N/A | SÍ | LEGACY | Reemplazar con /proveedor/dashboard |
| `/panel` | Legacy | DjangoFallback | N/A | Ninguno | None | ADMIN | Navegación dura a backend Django | N/A | SÍ | LEGACY | Reemplazar con /admin/dashboard |
