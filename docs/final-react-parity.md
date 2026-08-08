# Paridad React basada en código

La navegación normal no enlaza templates Django. Las búsquedas finales sobre `frontend/src` dan cero usos de `AdminFallbackCard`, `DjangoFallbackPage`, “Panel Clásico” y `window.location`.

Cobertura implementada:

- Storefront: home, catálogo, detalle, galería, preguntas/reseñas, wishlist, carrito y checkout.
- Cliente: resumen, perfil, direcciones, pedidos, detalle, tracking, notificaciones, tickets, membresía, seguridad y facturas.
- Premium: pago/cancelación Prime y compras recurrentes con programación, productos, pausa/activación y preparación del carrito.
- Administración: dashboard, productos, inventario, pedidos, proveedores, abastecimiento, cupones, promociones, pagos, tracking, Prime, reportes y control empresarial.
- Operaciones: portales Warehouse Manager, Supplier Manager, Support y proveedor externo, todos protegidos por sesión/rol o asociación activa.

Limitaciones verificables:

- No existe endpoint para generar archivos PDF de facturas; `/operaciones/api/facturas/` solo expone datos. React muestra los comprobantes y no inventa una descarga.
- `/panel/api/abastecimiento/` lista órdenes y su endpoint de acción permite recibir/cancelar; no hay endpoint HTTP para crear manualmente una orden desde React.
- La validación visual exhaustiva en navegadores, tamaños y cuentas de cada rol requiere credenciales y datos de ensayo controlados; no se declara aprobada solo por build.
