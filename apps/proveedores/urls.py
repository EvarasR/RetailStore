from django.urls import path
from . import views

app_name = "proveedores"

urlpatterns = [
    path("", views.panel_view, name="panel"),
    path("api/mi-panel/", views.api_mi_panel, name="api_mi_panel"),
    path("api/lista/", views.api_lista_proveedores, name="api_lista_proveedores"),
    path("api/producto/<int:cod_producto>/faltante/", views.api_proveedores_para_faltante, name="api_proveedores_para_faltante"),
    path("api/stock/actualizar/", views.api_actualizar_stock_proveedor, name="api_actualizar_stock_proveedor"),
]
