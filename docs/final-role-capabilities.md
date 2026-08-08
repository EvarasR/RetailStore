# Capacidades finales por rol

| Identidad | Portal React | Capacidades expuestas |
|---|---|---|
| CUSTOMER | storefront y `/cuenta` | Perfil, direcciones, wishlist, carrito, checkout, pedidos, tracking, devoluciones, facturas, notificaciones y soporte. |
| PREMIUM_CUSTOMER | CUSTOMER + Prime | Membresía, beneficios oficiales, pago/cancelación y compras recurrentes. |
| ADMIN | `/admin` | Catálogo, inventario, pedidos, proveedores, abastecimiento, marketing, pagos, tracking, Prime, reportes, usuarios, roles y permisos. |
| WAREHOUSE_MANAGER | `/warehouse` | Inventario, lotes, alertas, reservas, movimientos, preparación y recepción autorizada. |
| SUPPLIER_MANAGER | `/supplier-manager` | Proveedores, relaciones de productos, stock de proveedor y abastecimiento autorizado. |
| SUPPORT | `/support` | Tickets, respuestas públicas/internas, incidencias y consulta operativa de pedidos. |
| Proveedor externo | `/proveedor` | Solo el proveedor asociado activo: productos, stock, órdenes e historial. No es un rol. |

El backend vuelve a validar permisos y ownership en cada mutación. `ADMIN` no obtiene por sí solo la identidad de proveedor externo y nunca se crea el rol `PROVEEDOR`.
