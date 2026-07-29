from django.urls import path
from . import views

app_name = "administracion"

urlpatterns = [
    path("", views.panel_view, name="panel"),

    path("api/resumen/", views.api_resumen, name="api_resumen"),
    path("api/productos/", views.api_productos_admin, name="api_productos_admin"),
    path("api/productos/<int:cod_producto>/publicar/", views.api_publicar_producto, name="api_publicar_producto"),
    path("api/productos/<int:cod_producto>/pausar/", views.api_pausar_producto, name="api_pausar_producto"),
    path("api/productos/<int:cod_producto>/desactivar/", views.api_desactivar_producto, name="api_desactivar_producto"),
    path("api/inventario/", views.api_inventario, name="api_inventario"),
    path("api/pedidos/", views.api_pedidos_admin, name="api_pedidos_admin"),
    path("api/pedidos/<int:cod_pedido>/estado/", views.api_cambiar_estado_pedido, name="api_cambiar_estado_pedido"),
    path("api/proveedores/", views.api_proveedores_admin, name="api_proveedores_admin"),
    path("api/reportes/ventas/", views.api_reporte_ventas, name="api_reporte_ventas"),
]
