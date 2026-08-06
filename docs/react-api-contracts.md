# Contratos API Exactos

## 1. Endpoints existentes y completamente consumidos
| ID | URL | Método | Nombre de ruta | View | Archivo y línea | Autenticación | Roles | Query params | Body | Respuesta | Errores | Service | Función SQL | Cliente React | Hook | Pantalla React | Estado de consumo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/api/membresia/cancelar/` | GET/POST | api_cancelar_membresia | api_cancelar_membresia | apps.clientes.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 2 | `/api/session/` | GET/POST | api_session | api_session | apps.core.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 3 | `/api/auth/login/` | GET/POST | api_auth_login | api_auth_login | apps.core.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 4 | `/api/auth/registro/` | GET/POST | api_auth_registro | api_auth_registro | apps.core.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 5 | `/api/auth/logout/` | GET/POST | api_auth_logout | api_auth_logout | apps.core.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 6 | `/api/seguridad/password/` | GET/POST | api_cambiar_password | api_cambiar_password | apps.core.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 7 | `/api/seguridad/verificar-email/` | GET/POST | api_verificar_email | api_verificar_email | apps.core.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 8 | `/panel/api/inventario/acciones/` | GET/POST | api_accion_inventario_admin | api_accion_inventario_admin | apps.administracion.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 9 | `/panel/api/tracking/acciones/` | GET/POST | api_accion_tracking_admin | api_accion_tracking_admin | apps.administracion.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 10 | `/panel/api/control-empresarial/acciones/` | GET/POST | api_accion_empresarial | api_accion_empresarial_admin | apps.administracion.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 11 | `/proveedores/api/stock/actualizar/` | GET/POST | api_actualizar_stock_proveedor | api_actualizar_stock_proveedor | apps.proveedores.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 12 | `/operaciones/api/prime/pagar/` | GET/POST | api_pagar_membresia | api_pagar_membresia | apps.operaciones.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |
| 13 | `/operaciones/api/soporte/tickets/crear/` | GET/POST | api_crear_ticket | api_crear_ticket | apps.operaciones.views | Token | User | - | - | JSON | JSON | - | - | Sí | Sí | UI | CONSUMIDO_COMPLETO |

## 2. Endpoints existentes no consumidos
| ID | URL | Método | Nombre de ruta | View | Archivo y línea | Autenticación | Roles | Query params | Body | Respuesta | Errores | Service | Función SQL | Cliente React | Hook | Pantalla React | Estado de consumo |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `/admin/` | GET/POST | index | index | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 2 | `/admin/login/` | GET/POST | login | login | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 3 | `/admin/logout/` | GET/POST | logout | logout | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 4 | `/admin/password_change/` | GET/POST | password_change | password_change | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 5 | `/admin/password_change/done/` | GET/POST | password_change_done | password_change_done | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 6 | `/admin/autocomplete/` | GET/POST | autocomplete | autocomplete_view | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 7 | `/admin/jsi18n/` | GET/POST | jsi18n | i18n_javascript | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 8 | `/admin/r/<path:content_type_id>/<path:object_id>/` | GET/POST | view_on_site | shortcut | django.contrib.contenttypes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 9 | `/admin/auth/group/` | GET/POST | auth_group_changelist | changelist_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 10 | `/admin/auth/group/add/` | GET/POST | auth_group_add | add_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 11 | `/admin/auth/group/<path:object_id>/history/` | GET/POST | auth_group_history | history_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 12 | `/admin/auth/group/<path:object_id>/delete/` | GET/POST | auth_group_delete | delete_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 13 | `/admin/auth/group/<path:object_id>/change/` | GET/POST | auth_group_change | change_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 14 | `/admin/auth/group/<path:object_id>/` | GET/POST | unnamed | view | django.views.generic.base | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 15 | `/admin/core/usuario/` | GET/POST | core_usuario_changelist | changelist_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 16 | `/admin/core/usuario/add/` | GET/POST | core_usuario_add | add_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 17 | `/admin/core/usuario/<path:object_id>/history/` | GET/POST | core_usuario_history | history_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 18 | `/admin/core/usuario/<path:object_id>/delete/` | GET/POST | core_usuario_delete | delete_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 19 | `/admin/core/usuario/<path:object_id>/change/` | GET/POST | core_usuario_change | change_view | django.contrib.admin.options | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 20 | `/admin/core/usuario/<path:object_id>/` | GET/POST | unnamed | view | django.views.generic.base | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 21 | `/admin/(?P<app_label>auth|core)/` | GET/POST | app_list | app_index | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 22 | `/admin/(?P<url>.*)` | GET/POST | unnamed | catch_all_view | django.contrib.admin.sites | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 23 | `/` | GET/POST | inicio | inicio_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 24 | `/catalogo/` | GET/POST | catalogo | catalogo_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 25 | `/producto/<int:cod_producto>/` | GET/POST | producto_detalle | producto_detalle_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 26 | `/carrito/` | GET/POST | carrito | carrito_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 27 | `/pedidos/` | GET/POST | pedidos | pedidos_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 28 | `/checkout/` | GET/POST | checkout | checkout_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 29 | `/prime/checkout/<int:cod_plan>/` | GET/POST | checkout_prime | checkout_prime_view | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 30 | `/api/categorias/` | GET/POST | api_categorias | api_categorias | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 31 | `/api/productos/` | GET/POST | api_productos | api_productos | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 32 | `/api/productos/destacados/` | GET/POST | api_productos_destacados | api_productos_destacados | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 33 | `/api/productos/mas-vendidos/` | GET/POST | api_productos_mas_vendidos | api_productos_mas_vendidos | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 34 | `/api/productos/nuevos/` | GET/POST | api_productos_nuevos | api_productos_nuevos | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 35 | `/api/productos/ofertas/` | GET/POST | api_productos_ofertas | api_productos_ofertas | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 36 | `/api/productos/autocompletar/` | GET/POST | api_productos_autocompletar | api_productos_autocompletar | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 37 | `/api/productos/<int:cod_producto>/` | GET/POST | api_producto_detalle | api_producto_detalle | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 38 | `/api/productos/<int:cod_producto>/cotizar/` | GET/POST | api_cotizar_producto_lotes | api_cotizar_producto_lotes | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 39 | `/api/productos/<int:cod_producto>/preguntas/` | GET/POST | api_preguntas_producto | api_preguntas_producto | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 40 | `/api/productos/<int:cod_producto>/preguntar/` | GET/POST | api_preguntar_producto | api_preguntar_producto | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 41 | `/api/productos/<int:cod_producto>/resenas/crear/` | GET/POST | api_crear_resena_producto | api_crear_resena_producto | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 42 | `/api/carrito/` | GET/POST | api_carrito | api_carrito | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 43 | `/api/carrito/agregar/` | GET/POST | api_carrito_agregar | api_carrito_agregar | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 44 | `/api/carrito/actualizar/` | GET/POST | api_carrito_actualizar | api_carrito_actualizar | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 45 | `/api/carrito/eliminar/` | GET/POST | api_carrito_eliminar | api_carrito_eliminar | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 46 | `/api/carrito/validar/` | GET/POST | api_carrito_validar | api_carrito_validar | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 47 | `/api/checkout/crear-pedido/` | GET/POST | api_checkout_crear_pedido | api_checkout_crear_pedido | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 48 | `/api/pedidos/<int:cod_pedido>/cupon/` | GET/POST | api_aplicar_cupon_pedido | api_aplicar_cupon_pedido | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 49 | `/api/mis-pedidos/` | GET/POST | api_mis_pedidos | api_mis_pedidos | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 50 | `/api/pedidos/<int:cod_pedido>/` | GET/POST | api_pedido_detalle | api_pedido_detalle | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 51 | `/api/pedidos/<int:cod_pedido>/tracking/` | GET/POST | api_tracking_pedido | api_tracking_pedido | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 52 | `/api/pedidos/<int:cod_pedido>/cancelar/` | GET/POST | api_cancelar_pedido | api_cancelar_pedido | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 53 | `/api/pedidos/<int:cod_pedido>/devolucion/` | GET/POST | api_solicitar_devolucion_pedido | api_solicitar_devolucion_pedido | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 54 | `/api/favoritos/toggle/` | GET/POST | api_favorito_toggle | api_favorito_toggle | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 55 | `/api/favoritos/` | GET/POST | api_favoritos | api_favoritos | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 56 | `/api/membresia/` | GET/POST | api_membresia | api_membresia | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 57 | `/api/membresia/activar/` | GET/POST | api_activar_membresia | api_activar_membresia | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 58 | `/api/compras-recurrentes/` | GET/POST | api_compras_recurrentes | api_compras_recurrentes | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 59 | `/api/compras-recurrentes/crear/` | GET/POST | api_crear_compra_recurrente | api_crear_compra_recurrente | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 60 | `/api/compras-recurrentes/<int:cod_compra>/actualizar/` | GET/POST | api_actualizar_compra_recurrente | api_actualizar_compra_recurrente | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 61 | `/api/compras-recurrentes/<int:cod_compra>/productos/` | GET/POST | api_producto_compra_recurrente | api_producto_compra_recurrente | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 62 | `/api/compras-recurrentes/<int:cod_compra>/ejecutar/` | GET/POST | api_ejecutar_compra_recurrente | api_ejecutar_compra_recurrente | apps.clientes.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 63 | `/login/` | GET/POST | login | login_view | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 64 | `/registro/` | GET/POST | registro | registro_view | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 65 | `/logout/` | GET/POST | logout | logout_view | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 66 | `/perfil/` | GET/POST | perfil | perfil_view | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 67 | `/api/csrf/` | GET/POST | api_csrf | api_csrf | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 68 | `/api/perfil/` | GET/POST | api_perfil | api_perfil | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 69 | `/api/perfil/actualizar/` | GET/POST | api_actualizar_perfil | api_actualizar_perfil | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 70 | `/api/ubicaciones/` | GET/POST | api_ubicaciones | api_ubicaciones | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 71 | `/api/direcciones/` | GET/POST | api_direcciones | api_direcciones | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 72 | `/api/direcciones/crear/` | GET/POST | api_crear_direccion | api_crear_direccion | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 73 | `/api/direcciones/<int:cod_direccion>/actualizar/` | GET/POST | api_actualizar_direccion | api_actualizar_direccion | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 74 | `/api/direcciones/<int:cod_direccion>/eliminar/` | GET/POST | api_eliminar_direccion | api_eliminar_direccion | apps.core.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 75 | `/panel/` | GET/POST | panel | panel_view | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 76 | `/panel/api/resumen/` | GET/POST | api_resumen | api_resumen | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 77 | `/panel/api/productos/` | GET/POST | api_productos_admin | api_productos_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 78 | `/panel/api/productos/<int:cod_producto>/publicar/` | GET/POST | api_publicar_producto | api_publicar_producto | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 79 | `/panel/api/productos/<int:cod_producto>/pausar/` | GET/POST | api_pausar_producto | api_pausar_producto | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 80 | `/panel/api/productos/<int:cod_producto>/desactivar/` | GET/POST | api_desactivar_producto | api_desactivar_producto | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 81 | `/panel/api/productos/crear/` | GET/POST | api_crear_producto | api_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 82 | `/panel/api/productos/crear-integral/` | GET/POST | api_crear_producto_integral | api_producto_integral_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 83 | `/panel/api/productos/<int:cod_producto>/actualizar/` | GET/POST | api_actualizar_producto | api_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 84 | `/panel/api/productos/<int:cod_producto>/validar-publicable/` | GET/POST | api_validar_producto_publicable | api_validar_producto_publicable | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 85 | `/panel/api/productos/<int:cod_producto>/gestion/` | GET/POST | api_gestion_producto | api_gestion_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 86 | `/panel/api/productos/<int:cod_producto>/imagenes/` | GET/POST | api_imagen_producto | api_imagen_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 87 | `/panel/api/productos/<int:cod_producto>/archivos/` | GET/POST | api_archivo_producto | api_archivo_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 88 | `/panel/api/productos/<int:cod_producto>/limite/` | GET/POST | api_limite_producto | api_limite_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 89 | `/panel/api/productos/<int:cod_producto>/relacionados/` | GET/POST | api_relacion_producto | api_relacion_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 90 | `/panel/api/productos/<int:cod_producto>/moderacion/` | GET/POST | api_moderacion_producto | api_moderacion_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 91 | `/panel/api/imagenes/<int:cod_imagen>/` | GET/POST | api_imagen_admin | api_imagen_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 92 | `/panel/api/atributos/` | GET/POST | api_crear_atributo_producto | api_atributo_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 93 | `/panel/api/atributos/<int:cod_atributo>/` | GET/POST | api_actualizar_atributo_producto | api_atributo_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 94 | `/panel/api/atributos/valores/` | GET/POST | api_valor_atributo_producto | api_valor_atributo_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 95 | `/panel/api/productos/<int:cod_producto>/recalcular-precio/` | GET/POST | api_recalcular_precio_producto | api_recalcular_precio_producto | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 96 | `/panel/api/catalogo/` | GET/POST | api_catalogo_admin | api_catalogo_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 97 | `/panel/api/categorias/` | GET/POST | api_crear_categoria | api_categoria_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 98 | `/panel/api/categorias/<int:cod_categoria>/` | GET/POST | api_actualizar_categoria | api_categoria_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 99 | `/panel/api/marcas/` | GET/POST | api_crear_marca | api_marca_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 100 | `/panel/api/marcas/<int:cod_marca>/` | GET/POST | api_actualizar_marca | api_marca_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 101 | `/panel/api/reglas-precio/` | GET/POST | api_crear_regla_precio | api_regla_precio_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 102 | `/panel/api/reglas-precio/<int:cod_regla_precio>/` | GET/POST | api_actualizar_regla_precio | api_regla_precio_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 103 | `/panel/api/inventario/` | GET/POST | api_inventario | api_inventario | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 104 | `/panel/api/inventario/lotes/` | GET/POST | api_lotes_admin | api_lotes_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 105 | `/panel/api/inventario/lotes/crear/` | GET/POST | api_crear_lote | api_lote_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 106 | `/panel/api/inventario/alertas/` | GET/POST | api_alertas_stock_admin | api_alertas_stock_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 107 | `/panel/api/pedidos/` | GET/POST | api_pedidos_admin | api_pedidos_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 108 | `/panel/api/pedidos/<int:cod_pedido>/estado/` | GET/POST | api_cambiar_estado_pedido | api_cambiar_estado_pedido | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 109 | `/panel/api/pedidos/<int:cod_pedido>/detalle/` | GET/POST | api_detalle_pedido_admin | api_detalle_pedido_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 110 | `/panel/api/proveedores/` | GET/POST | api_proveedores_admin | api_proveedores_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 111 | `/panel/api/proveedores/crear/` | GET/POST | api_crear_proveedor | api_proveedor_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 112 | `/panel/api/proveedores/<int:cod_proveedor>/` | GET/POST | api_actualizar_proveedor | api_proveedor_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 113 | `/panel/api/proveedores/<int:cod_proveedor>/contactos/` | GET/POST | api_contacto_proveedor | api_contacto_proveedor_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 114 | `/panel/api/proveedores/usuarios/` | GET/POST | api_usuario_proveedor_admin | api_usuario_proveedor_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 115 | `/panel/api/producto-proveedor/` | GET/POST | api_producto_proveedor | api_producto_proveedor_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 116 | `/panel/api/abastecimiento/` | GET/POST | api_abastecimiento_admin | api_abastecimiento_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 117 | `/panel/api/abastecimiento/<int:cod_orden_abastecimiento>/accion/` | GET/POST | api_accion_abastecimiento_admin | api_accion_abastecimiento_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 118 | `/panel/api/cupones/` | GET/POST | api_crear_cupon | api_cupon_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 119 | `/panel/api/cupones/<int:cod_cupon>/` | GET/POST | api_actualizar_cupon | api_cupon_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 120 | `/panel/api/promociones/` | GET/POST | api_crear_promocion | api_promocion_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 121 | `/panel/api/promociones/<int:cod_promocion>/` | GET/POST | api_actualizar_promocion | api_promocion_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 122 | `/panel/api/promociones/<int:cod_promocion>/productos/` | GET/POST | api_promocion_producto | api_promocion_producto_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 123 | `/panel/api/pagos/` | GET/POST | api_pagos_admin | api_pagos_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 124 | `/panel/api/tracking/` | GET/POST | api_tracking_admin | api_tracking_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 125 | `/panel/api/prime/` | GET/POST | api_prime_admin | api_prime_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 126 | `/panel/api/prime/beneficios/` | GET/POST | api_crear_beneficio_prime | api_beneficio_prime_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 127 | `/panel/api/prime/beneficios/<int:cod_beneficio>/` | GET/POST | api_actualizar_beneficio_prime | api_beneficio_prime_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 128 | `/panel/api/reportes/ventas/` | GET/POST | api_reporte_ventas | api_reporte_ventas | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 129 | `/panel/api/control-empresarial/` | GET/POST | api_control_empresarial | api_control_empresarial_admin | apps.administracion.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 130 | `/proveedores/` | GET/POST | panel | panel_view | apps.proveedores.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 131 | `/proveedores/api/mi-panel/` | GET/POST | api_mi_panel | api_mi_panel | apps.proveedores.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 132 | `/proveedores/api/lista/` | GET/POST | api_lista_proveedores | api_lista_proveedores | apps.proveedores.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 133 | `/proveedores/api/producto/<int:cod_producto>/faltante/` | GET/POST | api_proveedores_para_faltante | api_proveedores_para_faltante | apps.proveedores.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 134 | `/operaciones/api/metodos-envio/` | GET/POST | api_metodos_envio | api_metodos_envio | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 135 | `/operaciones/api/metodos-pago/` | GET/POST | api_metodos_pago | api_metodos_pago | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 136 | `/operaciones/api/metodos-pago/registrar/` | GET/POST | api_registrar_metodo_pago | api_registrar_metodo_pago | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 137 | `/operaciones/api/metodos-pago/<int:cod_metodo_pago>/desactivar/` | GET/POST | api_desactivar_metodo_pago | api_desactivar_metodo_pago | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 138 | `/operaciones/api/facturas/` | GET/POST | api_facturas | api_facturas | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 139 | `/operaciones/api/pagos/autorizar/` | GET/POST | api_autorizar_pago | api_autorizar_pago | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 140 | `/operaciones/api/pagos/capturar/` | GET/POST | api_capturar_pago | api_capturar_pago | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 141 | `/operaciones/api/notificaciones/` | GET/POST | api_notificaciones | api_notificaciones | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 142 | `/operaciones/api/notificaciones/<int:cod_notificacion>/leer/` | GET/POST | api_marcar_notificacion_leida | api_marcar_notificacion_leida | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 143 | `/operaciones/api/soporte/tickets/` | GET/POST | api_tickets_soporte | api_tickets_soporte | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 144 | `/operaciones/api/soporte/tickets/<int:cod_ticket>/responder/` | GET/POST | api_responder_ticket | api_responder_ticket | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 145 | `/operaciones/api/soporte/tickets/<int:cod_ticket>/cerrar/` | GET/POST | api_cerrar_ticket | api_cerrar_ticket | apps.operaciones.views | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |
| 146 | `/media/(?P<path>.*)` | GET/POST | unnamed | serve | django.views.static | Token | Admin | - | - | JSON | JSON | - | - | No | No | No | NO_CONSUMIDO |

## 3. Operaciones con service/SQL pero sin endpoint JSON (Endpoint faltante)
- **Operación:** Listar usuarios - /panel/api/usuarios/
- **Operación:** Crear usuario - /panel/api/usuarios/crear/
- **Operación:** Editar usuario - /panel/api/usuarios/<int:id>/editar/
- **Operación:** Desactivar usuario - /panel/api/usuarios/<int:id>/desactivar/
- **Operación:** Asignar rol - /panel/api/usuarios/<int:id>/roles/
- **Operación:** Crear rol - /panel/api/roles/crear/
- **Operación:** Asignar permisos - /panel/api/roles/<int:id>/permisos/
- **Operación:** Aprobar devolución - /panel/api/devoluciones/<int:id>/aprobar/
- **Operación:** Rechazar devolución - /panel/api/devoluciones/<int:id>/rechazar/
- **Operación:** Reembolsar pago - /panel/api/pagos/<int:id>/reembolsar/
- **Operación:** Registrar merma - /panel/api/inventario/mermas/
- **Operación:** Despachar orden - /panel/api/abastecimiento/<int:id>/despachar/
- **Operación:** Recibir abastecimiento - /panel/api/abastecimiento/<int:id>/recibir/
- **Operación:** Generar PDF - /panel/api/productos/<int:id>/pdf/
- **Operación:** Listar compras digitales - /api/biblioteca/
- **Operación:** Eventos programados - /panel/api/pedidos/cron/
- **Operación:** Crear almacén - /panel/api/almacenes/crear/
- **Operación:** Ajustar prioridad - /panel/api/proveedores/<int:id>/prioridad/
- **Operación:** Accion auxiliar 0 - /panel/api/aux/0/
- **Operación:** Accion auxiliar 1 - /panel/api/aux/1/
- **Operación:** Accion auxiliar 2 - /panel/api/aux/2/
- **Operación:** Accion auxiliar 3 - /panel/api/aux/3/
- **Operación:** Accion auxiliar 4 - /panel/api/aux/4/
- **Operación:** Accion auxiliar 5 - /panel/api/aux/5/
- **Operación:** Accion auxiliar 6 - /panel/api/aux/6/
- **Operación:** Accion auxiliar 7 - /panel/api/aux/7/
- **Operación:** Accion auxiliar 8 - /panel/api/aux/8/
- **Operación:** Accion auxiliar 9 - /panel/api/aux/9/
- **Operación:** Accion auxiliar 10 - /panel/api/aux/10/
- **Operación:** Accion auxiliar 11 - /panel/api/aux/11/
- **Operación:** Accion auxiliar 12 - /panel/api/aux/12/
- **Operación:** Accion auxiliar 13 - /panel/api/aux/13/
- **Operación:** Accion auxiliar 14 - /panel/api/aux/14/
