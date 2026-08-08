# Checklist final de producción

## Automatizado

- [x] Frontend reinstalado de forma determinista con `npm ci`; dependencias Python verificadas en el venv y perfil adicional disponible en `requirements-prod.txt`.
- [x] `manage.py check` y `manage.py check --deploy` con variables productivas simuladas.
- [x] `compileall`, 21 tests Django y `collectstatic`.
- [x] `npm run lint`, 27 tests Vitest, `npm run build` y `npm audit`.
- [x] Confirmados cero backups, secretos conocidos y scripts destructivos versionados; las plantillas conservan únicamente marcadores `CHANGE_ME`.
- [x] Confirmados cero enlaces internos a Django y cero navegación dura en `frontend/src`.
- [x] PDF privado válido, autorización propietario/roles, adjunto HTML+texto y cola idempotente verificados localmente.
- [x] Login y registro limitados a email y contraseña; rutas y dependencias Google retiradas.
- [x] Automatización promocional wishlist/descuento desactivada sin alterar descuentos ni favoritos.

## Manual con datos aislados

Ejecutar en claro y oscuro a 360, 390, 768, 1024, 1366 y 1920 px. Registrar evidencia, usuario y fecha; no marcar sin ejecución.

- [ ] CUSTOMER: registro, login, catálogo, producto, wishlist, carrito, checkout, pago, factura, pedido, tracking, devolución, notificación, ticket y logout.
- [ ] PREMIUM_CUSTOMER: alta/cancelación Prime, beneficios y compras recurrentes.
- [ ] ADMIN: formularios y acciones de cada módulo, incluidos usuarios/roles/permisos.
- [ ] WAREHOUSE_MANAGER: inventario, lotes, alertas, pedidos y recepción.
- [ ] SUPPLIER_MANAGER: proveedor-producto, stock y abastecimiento.
- [ ] SUPPORT: ticket, respuesta interna/pública, incidencia y pedido.
- [ ] Proveedor externo: aislamiento de productos, stock, órdenes e historial.
- [ ] Teclado, foco visible, labels, contraste, diálogos y mensajes de error.
- [ ] SMTP Gmail real: recepción, texto alternativo, adjunto PDF, reintento y rebote.
- [ ] Worker de correo activo y monitorizado; Nginx bloquea `/media/facturas/`.

Antes de desplegar rota `SECRET_KEY` y la contraseña PostgreSQL que hayan existido durante desarrollo. Verifica HTTPS, cookies seguras, HSTS, ownership de `/media` y permisos del socket Gunicorn.
