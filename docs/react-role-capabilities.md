# Capacidades Exactas por Rol

| Módulo | Operación | CUSTOMER | PREMIUM_CUSTOMER | ADMIN | WAREHOUSE_MANAGER | SUPPLIER_MANAGER | SUPPORT | PROVEEDOR_EXTERNO | Permiso SQL/Django | Endpoint | Estado React |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Auth | Obtener CSRF | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/csrf/ | AUSENTE |
| Auth | Iniciar sesión | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/auth/login/ | COMPLETO |
| Auth | Cerrar sesión | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/auth/logout/ | COMPLETO |
| Auth | Crear cuenta | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/auth/registro/ | COMPLETO |
| Auth | Cambiar contraseña | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/seguridad/password/ | COMPLETO |
| Auth | Verificar email | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/seguridad/verificar-email/ | COMPLETO |
| Auth | Consultar sesión | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/session/ | COMPLETO |
| Cuenta | Consultar perfil | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/perfil/ | AUSENTE |
| Cuenta | Editar perfil | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/perfil/actualizar/ | AUSENTE |
| Cuenta | Listar direcciones | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/direcciones/ | AUSENTE |
| Cuenta | Crear dirección | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/direcciones/crear/ | AUSENTE |
| Cuenta | Editar dirección | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/direcciones/<int:cod_direccion>/actualizar/ | AUSENTE |
| Cuenta | Eliminar dirección | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/direcciones/<int:cod_direccion>/eliminar/ | AUSENTE |
| Storefront | Listar catálogo | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/ | AUSENTE |
| Storefront | Consultar destacados | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/destacados/ | AUSENTE |
| Storefront | Consultar nuevos | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/nuevos/ | AUSENTE |
| Storefront | Consultar ofertas | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/ofertas/ | AUSENTE |
| Storefront | Consultar más vendidos | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/mas-vendidos/ | AUSENTE |
| Storefront | Consultar sugerencias | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/autocompletar/ | AUSENTE |
| Storefront | Listar categorías | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/categorias/ | AUSENTE |
| Producto | Consultar detalle | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/<int:cod_producto>/ | AUSENTE |
| Producto | Cotizar cantidad | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/<int:cod_producto>/cotizar/ | AUSENTE |
| Producto | Listar preguntas | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | PERMITIDO | DB_Perm | /api/productos/<int:cod_producto>/preguntas/ | AUSENTE |
| Producto | Crear pregunta | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/productos/<int:cod_producto>/preguntar/ | AUSENTE |
| Producto | Crear reseña | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/productos/<int:cod_producto>/resenas/crear/ | AUSENTE |
| Producto | Listar favoritos | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/favoritos/ | AUSENTE |
| Producto | Alternar favorito | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/favoritos/toggle/ | AUSENTE |
| Carrito | Consultar carrito | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/carrito/ | AUSENTE |
| Carrito | Agregar item | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/carrito/agregar/ | AUSENTE |
| Carrito | Actualizar cantidad | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/carrito/actualizar/ | AUSENTE |
| Carrito | Eliminar item | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/carrito/eliminar/ | AUSENTE |
| Carrito | Validar límites | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/carrito/validar/ | AUSENTE |
| Checkout | Crear pedido | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/checkout/crear-pedido/ | AUSENTE |
| Checkout | Listar métodos envío | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/metodos-envio/ | PARCIAL |
| Checkout | Listar métodos pago | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/metodos-pago/ | PARCIAL |
| Checkout | Registrar método pago | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/metodos-pago/registrar/ | PARCIAL |
| Pedidos | Listar pedidos propios | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/mis-pedidos/ | AUSENTE |
| Pedidos | Consultar detalle pedido | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/pedidos/<int:cod_pedido>/ | AUSENTE |
| Pedidos | Consultar tracking | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/pedidos/<int:cod_pedido>/tracking/ | AUSENTE |
| Pedidos | Cancelar pedido | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/pedidos/<int:cod_pedido>/cancelar/ | AUSENTE |
| Pedidos | Solicitar devolución | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/pedidos/<int:cod_pedido>/devolucion/ | AUSENTE |
| Pedidos | Listar facturas | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/facturas/ | AUSENTE |
| Pedidos | Aplicar cupón | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/pedidos/<int:cod_pedido>/cupon/ | AUSENTE |
| Prime | Consultar beneficios | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/prime/beneficios/ | AUSENTE |
| Prime | Activar membresía | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/membresia/activar/ | AUSENTE |
| Prime | Pagar membresía | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/prime/pagar/ | COMPLETO |
| Prime | Cancelar membresía | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/membresia/cancelar/ | COMPLETO |
| Recurrentes | Listar recurrentes | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/compras-recurrentes/ | AUSENTE |
| Recurrentes | Crear recurrente | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/compras-recurrentes/crear/ | AUSENTE |
| Recurrentes | Ejecutar recurrente | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/compras-recurrentes/<int:cod_compra>/ejecutar/ | AUSENTE |
| Soporte | Listar tickets | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/soporte/tickets/ | COMPLETO |
| Soporte | Crear ticket | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/soporte/tickets/crear/ | COMPLETO |
| Soporte | Responder ticket | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/soporte/tickets/<int:cod_ticket>/responder/ | AUSENTE |
| Cuenta | Listar notificaciones | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/notificaciones/ | AUSENTE |
| Cuenta | Marcar leída | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/notificaciones/<int:cod_notificacion>/leer/ | AUSENTE |
| Admin Catálogo | Listar administración | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/ | AUSENTE |
| Admin Catálogo | Crear básico | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/crear/ | AUSENTE |
| Admin Catálogo | Crear integral | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/crear-integral/ | AUSENTE |
| Admin Catálogo | Editar producto | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/actualizar/ | AUSENTE |
| Admin Catálogo | Publicar producto | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/publicar/ | AUSENTE |
| Admin Catálogo | Pausar producto | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/pausar/ | AUSENTE |
| Admin Catálogo | Desactivar producto | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/desactivar/ | AUSENTE |
| Admin Catálogo | Validar publicabilidad | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/validar-publicable/ | AUSENTE |
| Admin Catálogo | Gestionar imágenes | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/imagenes/ | AUSENTE |
| Admin Catálogo | Gestionar archivos | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/archivos/ | AUSENTE |
| Admin Catálogo | Recalcular precio | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/recalcular-precio/ | AUSENTE |
| Admin Catálogo | Moderar reseñas | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/moderacion/ | AUSENTE |
| Admin Catálogo | Configurar límites | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/limite/ | AUSENTE |
| Admin Catálogo | Asociar productos | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:cod_producto>/relacionados/ | AUSENTE |
| Admin Catálogo | Listar categorías admin | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/categorias/ | AUSENTE |
| Admin Catálogo | Crear/Editar categoría | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/categorias/<int:cod_categoria>/ | AUSENTE |
| Admin Catálogo | Listar marcas | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/marcas/ | AUSENTE |
| Admin Catálogo | Crear/Editar marca | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/marcas/<int:cod_marca>/ | AUSENTE |
| Admin Catálogo | Listar atributos | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/atributos/ | AUSENTE |
| Admin Catálogo | Crear atributo | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/atributos/<int:cod_atributo>/ | AUSENTE |
| Admin Catálogo | Listar reglas precio | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/reglas-precio/ | AUSENTE |
| Admin Catálogo | Crear regla precio | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/reglas-precio/<int:cod_regla_precio>/ | AUSENTE |
| Admin Promos | Listar cupones | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/cupones/ | AUSENTE |
| Admin Promos | Crear cupón | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/cupones/<int:cod_cupon>/ | AUSENTE |
| Admin Promos | Listar promociones | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/promociones/ | AUSENTE |
| Admin Promos | Crear promoción | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/promociones/<int:cod_promocion>/ | AUSENTE |
| Admin Promos | Asociar productos promo | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/promociones/<int:cod_promocion>/productos/ | AUSENTE |
| Admin Pedidos | Listar todos pedidos | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/pedidos/ | AUSENTE |
| Admin Pedidos | Consultar detalle admin | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/pedidos/<int:cod_pedido>/detalle/ | AUSENTE |
| Admin Pedidos | Actualizar estado pedido | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/pedidos/<int:cod_pedido>/estado/ | AUSENTE |
| Admin Pedidos | Listar transacciones | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/pagos/ | AUSENTE |
| Admin Pedidos | Autorizar pago | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/pagos/autorizar/ | AUSENTE |
| Admin Pedidos | Capturar pago | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /operaciones/api/pagos/capturar/ | AUSENTE |
| Warehouse | Listar inventario global | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/inventario/ | COMPLETO |
| Warehouse | Listar alertas faltantes | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/inventario/alertas/ | AUSENTE |
| Warehouse | Listar lotes | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/inventario/lotes/ | AUSENTE |
| Warehouse | Crear lote | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/inventario/lotes/crear/ | AUSENTE |
| Warehouse | Ejecutar ajuste manual | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/inventario/acciones/ | COMPLETO |
| Warehouse | Listar guías | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/tracking/ | COMPLETO |
| Warehouse | Registrar hito logística | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/tracking/acciones/ | COMPLETO |
| Supplier Admin | Listar proveedores | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/proveedores/ | AUSENTE |
| Supplier Admin | Crear proveedor | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/proveedores/crear/ | AUSENTE |
| Supplier Admin | Editar proveedor | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/proveedores/<int:cod_proveedor>/ | AUSENTE |
| Supplier Admin | Listar usuarios asociados | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/proveedores/usuarios/ | AUSENTE |
| Supplier Admin | Asociar producto proveedor | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/producto-proveedor/ | AUSENTE |
| Supplier Admin | Listar órdenes compra | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/abastecimiento/ | AUSENTE |
| Supplier Admin | Aprobar orden compra | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/abastecimiento/<int:cod_orden_abastecimiento>/accion/ | AUSENTE |
| External | Consultar resumen | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | DB_Perm | /proveedores/api/mi-panel/ | AUSENTE |
| External | Listar órdenes asignadas | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | DB_Perm | /proveedores/api/lista/ | AUSENTE |
| External | Consultar faltante asignado | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | DB_Perm | /proveedores/api/producto/<int:cod_producto>/faltante/ | AUSENTE |
| External | Reportar actualización stock | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | DB_Perm | /proveedores/api/stock/actualizar/ | COMPLETO |
| Support Admin | Listar tickets globales | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | DB_Perm | /operaciones/api/soporte/tickets/ | COMPLETO |
| Support Admin | Cerrar ticket | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | DB_Perm | /operaciones/api/soporte/tickets/<int:cod_ticket>/cerrar/ | AUSENTE |
| Admin Core | Consultar resumen | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/resumen/ | AUSENTE |
| Admin Core | Consultar ventas | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/reportes/ventas/ | AUSENTE |
| Admin Core | Listar auditoría | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/control-empresarial/ | COMPLETO |
| Admin Core | Ejecutar acción auditoría | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/control-empresarial/acciones/ | COMPLETO |
| Auth | Listar usuarios | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/usuarios/ | BLOQUEADO |
| Auth | Crear usuario | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/usuarios/crear/ | BLOQUEADO |
| Auth | Editar usuario | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/usuarios/<int:id>/editar/ | BLOQUEADO |
| Auth | Desactivar usuario | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/usuarios/<int:id>/desactivar/ | BLOQUEADO |
| Auth | Asignar rol | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/usuarios/<int:id>/roles/ | BLOQUEADO |
| Auth | Crear rol | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/roles/crear/ | BLOQUEADO |
| Auth | Asignar permisos | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/roles/<int:id>/permisos/ | BLOQUEADO |
| Admin Pedidos | Aprobar devolución | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/devoluciones/<int:id>/aprobar/ | BLOQUEADO |
| Admin Pedidos | Rechazar devolución | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/devoluciones/<int:id>/rechazar/ | BLOQUEADO |
| Admin Pedidos | Reembolsar pago | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/pagos/<int:id>/reembolsar/ | BLOQUEADO |
| Warehouse | Registrar merma | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/inventario/mermas/ | BLOQUEADO |
| Supplier Admin | Despachar orden | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/abastecimiento/<int:id>/despachar/ | BLOQUEADO |
| Warehouse | Recibir abastecimiento | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/abastecimiento/<int:id>/recibir/ | BLOQUEADO |
| Admin Catálogo | Generar PDF | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/productos/<int:id>/pdf/ | BLOQUEADO |
| Cuenta | Listar compras digitales | PERMITIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /api/biblioteca/ | BLOQUEADO |
| Admin Pedidos | Eventos programados | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/pedidos/cron/ | BLOQUEADO |
| Warehouse | Crear almacén | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/almacenes/crear/ | BLOQUEADO |
| Supplier Admin | Ajustar prioridad | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/proveedores/<int:id>/prioridad/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 0 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/0/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 1 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/1/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 2 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/2/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 3 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/3/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 4 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/4/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 5 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/5/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 6 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/6/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 7 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/7/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 8 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/8/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 9 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/9/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 10 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/10/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 11 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/11/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 12 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/12/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 13 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/13/ | BLOQUEADO |
| Admin Aux | Accion auxiliar 14 | PROHIBIDO | PROHIBIDO | PERMITIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | PROHIBIDO | DB_Perm | /panel/api/aux/14/ | BLOQUEADO |
