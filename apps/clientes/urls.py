from django.urls import path
from . import views

app_name = "clientes"

urlpatterns = [
    path("", views.inicio_view, name="inicio"),
    path("catalogo/", views.catalogo_view, name="catalogo"),
    path("producto/<int:cod_producto>/", views.producto_detalle_view, name="producto_detalle"),
    path("carrito/", views.carrito_view, name="carrito"),
    path("pedidos/", views.pedidos_view, name="pedidos"),
    path("checkout/", views.checkout_view, name="checkout"),
    path("prime/checkout/<int:cod_plan>/", views.checkout_prime_view, name="checkout_prime"),

    # APIs públicas / cliente.
    path("api/categorias/", views.api_categorias, name="api_categorias"),
    path("api/productos/", views.api_productos, name="api_productos"),
    path("api/productos/destacados/", views.api_productos_destacados, name="api_productos_destacados"),
    path("api/productos/<int:cod_producto>/", views.api_producto_detalle, name="api_producto_detalle"),
    path("api/productos/<int:cod_producto>/cotizar/", views.api_cotizar_producto_lotes, name="api_cotizar_producto_lotes"),
    path("api/productos/<int:cod_producto>/preguntas/", views.api_preguntas_producto, name="api_preguntas_producto"),
    path("api/productos/<int:cod_producto>/preguntar/", views.api_preguntar_producto, name="api_preguntar_producto"),
    path("api/productos/<int:cod_producto>/resenas/crear/", views.api_crear_resena_producto, name="api_crear_resena_producto"),

    path("api/carrito/", views.api_carrito, name="api_carrito"),
    path("api/carrito/agregar/", views.api_carrito_agregar, name="api_carrito_agregar"),
    path("api/carrito/actualizar/", views.api_carrito_actualizar, name="api_carrito_actualizar"),
    path("api/carrito/eliminar/", views.api_carrito_eliminar, name="api_carrito_eliminar"),
    path("api/carrito/validar/", views.api_carrito_validar, name="api_carrito_validar"),

    path("api/checkout/crear-pedido/", views.api_checkout_crear_pedido, name="api_checkout_crear_pedido"),
    path("api/pedidos/<int:cod_pedido>/cupon/", views.api_aplicar_cupon_pedido, name="api_aplicar_cupon_pedido"),
    path("api/mis-pedidos/", views.api_mis_pedidos, name="api_mis_pedidos"),
    path("api/pedidos/<int:cod_pedido>/", views.api_pedido_detalle, name="api_pedido_detalle"),
    path("api/pedidos/<int:cod_pedido>/tracking/", views.api_tracking_pedido, name="api_tracking_pedido"),
    path("api/pedidos/<int:cod_pedido>/cancelar/", views.api_cancelar_pedido, name="api_cancelar_pedido"),
    path("api/pedidos/<int:cod_pedido>/devolucion/", views.api_solicitar_devolucion_pedido, name="api_solicitar_devolucion_pedido"),

    path("api/favoritos/toggle/", views.api_favorito_toggle, name="api_favorito_toggle"),
    path("api/favoritos/", views.api_favoritos, name="api_favoritos"),
    path("api/membresia/", views.api_membresia, name="api_membresia"),
    path("api/membresia/activar/", views.api_activar_membresia, name="api_activar_membresia"),
    path("api/membresia/cancelar/", views.api_cancelar_membresia, name="api_cancelar_membresia"),
    path("api/compras-recurrentes/", views.api_compras_recurrentes, name="api_compras_recurrentes"),
    path("api/compras-recurrentes/crear/", views.api_crear_compra_recurrente, name="api_crear_compra_recurrente"),
    path("api/compras-recurrentes/<int:cod_compra>/actualizar/", views.api_actualizar_compra_recurrente, name="api_actualizar_compra_recurrente"),
    path("api/compras-recurrentes/<int:cod_compra>/productos/", views.api_producto_compra_recurrente, name="api_producto_compra_recurrente"),
    path("api/compras-recurrentes/<int:cod_compra>/ejecutar/", views.api_ejecutar_compra_recurrente, name="api_ejecutar_compra_recurrente"),
]
