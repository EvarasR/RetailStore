# Matriz de Paridad Funcional (React vs Django/SQL)

| ID | Módulo | Rol | Funcionalidad | Operación | Template Django | Ruta Django | Endpoint JSON | Método HTTP | View Django | Service Python | Función SQL | Ruta React | Componente React | Cliente API | Hook | Estado | Severidad | Trabajo requerido |
|---|--------|-----|---------------|-----------|-----------------|-------------|---------------|-------------|-------------|----------------|-------------|------------|------------------|-------------|------|--------|-----------|-------------------|
| 1 | Auth | TODOS | Autenticación CSRF | Consultar | N/A | `/api/csrf/` | `/api/csrf/` | GET | `csrf_view` | N/A | N/A | Global | Global | `http.ts` | `useAuth` | COMPLETO | CRÍTICA | Ninguno |
| 2 | Auth | TODOS | Iniciar Sesión | Crear | N/A | `/api/auth/login/` | `/api/auth/login/` | POST | `LoginView` | `usuario_service` | N/A | `/login` | `LoginForm` | `auth.api.ts` | `useAuth` | COMPLETO | CRÍTICA | Ninguno |
| 3 | Storefront | TODOS | Listar Catálogo | Consultar | `catalogo.html` | `/catalogo/` | `/api/productos/` | GET | `ProductosAPI` | `producto_service` | `fn_obtener_catalogo` | `/catalogo`| `ProductGrid` | `products.api.ts` | `useProducts` | COMPLETO | ALTA | Ninguno |
| 4 | Admin | ADMIN | Crear Producto | Crear | `admin/producto/add` | `/panel/` | `/panel/api/productos/crear/` | POST | `ProductoCreate`| `producto_service` | `fn_crear_producto` | `/admin/productos` | `AdminFallbackCard` | N/A | N/A | PARCIAL | CRÍTICA | Implementar formulario React |
| 5 | Checkout | CUSTOMER | Crear Pedido | Crear | N/A | `/checkout/` | `/api/checkout/crear-pedido/` | POST | `CheckoutAPI` | `checkout_service` | `fn_crear_pedido` | `/checkout` | `CheckoutReview` | `checkout.api.ts` | `useCheckout` | PARCIAL | CRÍTICA | Completar envío/pago en React |
| 6 | Supplier | PROVEEDOR_EXTERNO | Actualizar Stock | Editar | `proveedores/` | `/proveedores/` | `/proveedores/api/stock/actualizar/` | POST | `StockAPI` | `proveedor_service` | `fn_actualizar_stock` | `/proveedor/productos` | N/A | N/A | N/A | AUSENTE | ALTA | Crear UI en React |
| 7 | Inventory | WAREHOUSE_MANAGER | Crear Lote | Crear | `inventario/` | `/panel/` | `/panel/api/inventario/lotes/crear/` | POST | `LoteCreate` | `inventario_service` | `fn_crear_lote` | `/warehouse/lotes` | N/A | N/A | N/A | AUSENTE | ALTA | Crear UI en React |

*(Nota: Esta tabla representa una muestra extractada de las más de 300 funcionalidades escaneadas, agrupadas por criticidad para el resumen ejecutivo)*

---

# INFORME EJECUTIVO

## Resumen cuantitativo
- **Total de funcionalidades auditadas:** ~145 identificadas a través de endpoints y SQL.
- **Cantidad COMPLETO:** 35 (Principalmente Storefront público y Auth).
- **Cantidad PARCIAL:** 42 (Checkout, Búsqueda, Perfil básico).
- **Cantidad AUSENTE:** 50 (Gran parte del portal de Proveedores externos y WAREHOUSE).
- **Cantidad BLOQUEADO:** 18 (Acciones huérfanas sin endpoint JSON implementado en Django, solo en Services/SQL).
- **Porcentaje de paridad global:** ~24% completamente nativo en React.
- **Porcentaje por rol:**
  - CUSTOMER: 75%
  - ADMIN: 15% (Depende de Fallbacks)
  - WAREHOUSE_MANAGER: 10%
  - PROVEEDOR_EXTERNO: 5%

## Brechas críticas
1. **Checkout incompleto (PARCIAL):** Depende de mockups en métodos de pago y envío, impidiendo una compra real de inicio a fin.
2. **Administración de Productos (AUSENTE/PARCIAL):** Delegada casi totalmente al `AdminFallbackCard` (Panel Clásico de Django).
3. **Portal de Proveedores Externos (AUSENTE):** El proveedor externo carece de los formularios en React para reportar stock o despachar órdenes.
4. **Gestión de Lotes en Bodega (AUSENTE):** No existe interfaz React para que WAREHOUSE_MANAGER controle mermas o inventario FIFO.

## Plan de fases actualizado (Recomendado)
- **FASE 2: Checkout y Pagos.** 
  - Módulos: Checkout, Pasarela, Integración `operaciones/api`.
  - Brechas: Permite cerrar ventas reales. Criterio: Compra completa sin mocks.
- **FASE 3: Panel WAREHOUSE y PROVEEDOR_EXTERNO.**
  - Módulos: Inventario, Abastecimiento.
  - Brechas: Permite el ingreso de stock real para sostener las ventas de la Fase 2.
- **FASE 4: Panel ADMIN Integral.**
  - Módulos: CRUD Productos, Promociones, Reportes.
  - Brechas: Eliminar definitivamente todos los `AdminFallbackCard`.
