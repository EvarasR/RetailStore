# Mapa de Rutas de React

Este documento presenta el árbol de rutas públicas y protegidas mapeadas en el frontend React.

## Árbol de Rutas Actuales

- `/` (en AppRouter.tsx)
- `/catalogo` (en AppRouter.tsx)
- `/producto/:id` (en AppRouter.tsx)
- `/carrito` (en AppRouter.tsx)
- `/checkout` (en AppRouter.tsx)
- `/login` (en AppRouter.tsx)
- `/registro` (en AppRouter.tsx)
- `/cuenta` (en AppRouter.tsx)
- `/cuenta/perfil` (en AppRouter.tsx)
- `/cuenta/direcciones` (en AppRouter.tsx)
- `/cuenta/pedidos` (en AppRouter.tsx)
- `/cuenta/pedidos/:id` (en AppRouter.tsx)
- `/cuenta/tracking/:id` (en AppRouter.tsx)
- `/cuenta/wishlist` (en AppRouter.tsx)
- `/cuenta/notificaciones` (en AppRouter.tsx)
- `/cuenta/soporte` (en AppRouter.tsx)
- `/cuenta/membresia` (en AppRouter.tsx)
- `/cuenta/seguridad` (en AppRouter.tsx)
- `/admin` (en AppRouter.tsx)
- `/admin/dashboard` (en AppRouter.tsx)
- `/admin/productos` (en AppRouter.tsx)
- `/admin/pedidos` (en AppRouter.tsx)
- `/admin/inventario` (en AppRouter.tsx)
- `/admin/proveedores` (en AppRouter.tsx)
- `/admin/abastecimiento` (en AppRouter.tsx)
- `/admin/cupones` (en AppRouter.tsx)
- `/admin/promociones` (en AppRouter.tsx)
- `/admin/pagos` (en AppRouter.tsx)
- `/admin/tracking` (en AppRouter.tsx)
- `/admin/prime` (en AppRouter.tsx)
- `/admin/reportes` (en AppRouter.tsx)
- `/admin/control` (en AppRouter.tsx)
- `/warehouse` (en AppRouter.tsx)
- `/warehouse/dashboard` (en AppRouter.tsx)
- `/warehouse/inventario` (en AppRouter.tsx)
- `/warehouse/lotes` (en AppRouter.tsx)
- `/warehouse/alertas` (en AppRouter.tsx)
- `/warehouse/pedidos` (en AppRouter.tsx)
- `/supplier-manager` (en AppRouter.tsx)
- `/supplier-manager/dashboard` (en AppRouter.tsx)
- `/supplier-manager/proveedores` (en AppRouter.tsx)
- `/supplier-manager/abastecimiento` (en AppRouter.tsx)
- `/supplier-manager/productos` (en AppRouter.tsx)
- `/supplier-manager/faltantes` (en AppRouter.tsx)
- `/support` (en AppRouter.tsx)
- `/support/dashboard` (en AppRouter.tsx)
- `/support/tickets` (en AppRouter.tsx)
- `/support/incidencias` (en AppRouter.tsx)
- `/support/pedidos` (en AppRouter.tsx)
- `/proveedor` (en AppRouter.tsx)
- `/proveedor/dashboard` (en AppRouter.tsx)
- `/proveedor/productos` (en AppRouter.tsx)
- `/proveedor/ordenes` (en AppRouter.tsx)
- `/proveedor/historial` (en AppRouter.tsx)
- `/perfil` (en AppRouter.tsx)
- `/pedidos` (en AppRouter.tsx)
- `/panel` (en AppRouter.tsx)
- `/proveedores` (en AppRouter.tsx)
- `*` (en AppRouter.tsx)

## Árboles por Rol (Propuestos y Actuales)
- **Público**: `/`, `/catalogo`, `/producto/:id`, `/carrito`, `/checkout`, `/login`, `/registro`
- **Cuenta (CUSTOMER/PREMIUM)**: `/cuenta/*`
- **ADMIN**: `/admin/*`
- **WAREHOUSE_MANAGER**: `/warehouse/*`
- **SUPPLIER_MANAGER**: `/supplier-manager/*`
- **SUPPORT**: `/support/*`
- **PROVEEDOR_EXTERNO**: `/proveedor/*`

*Nota: Se observan rutas como `/perfil`, `/pedidos`, `/panel`, `/proveedores` que son rutas 'legacy' o redirecciones al backend Django que deben ser absorbidas completamente por los módulos nativos mostrados arriba.*
