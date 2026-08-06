# Capacidades por Rol (React + Django)

## 1. CUSTOMER
- **Consultar**: Catálogo, productos, carrito, perfil, pedidos.
- **Crear**: Pedidos, tickets de soporte.
- **Prohibido**: Acceder a `/admin`, `/panel`, `/warehouse`.

## 2. PREMIUM_CUSTOMER
- Igual que CUSTOMER, más beneficios Prime (precios especiales, envíos).

## 3. ADMIN
- **Consultar/Crear/Editar**: Control total sobre catálogo, usuarios, pedidos, inventario, reportes.
- *Nota:* Gran parte recae en el Panel Clásico de Django actualmente.

## 4. WAREHOUSE_MANAGER
- **Consultar/Editar**: Inventario, lotes, estados de pedidos (despacho), alertas.

## 5. SUPPLIER_MANAGER (Gestor Interno)
- **Consultar/Editar**: Proveedores internos, métricas de abastecimiento, récord de faltantes, órdenes de compra a proveedores.

## 6. SUPPORT
- **Consultar/Editar**: Tickets de usuarios, historial de pedidos asociado a tickets.

## 7. PROVEEDOR_EXTERNO (Usuario externo)
- **Consultar/Editar**: *SOLO* sus propios productos asociados y órdenes de abastecimiento dirigidas a su organización. Aislado completamente del resto del sistema.
