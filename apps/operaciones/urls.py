from django.urls import path
from . import views

app_name = "operaciones"

urlpatterns = [
    path("api/metodos-envio/", views.api_metodos_envio, name="api_metodos_envio"),
    path("api/metodos-pago/", views.api_metodos_pago, name="api_metodos_pago"),
    path("api/metodos-pago/registrar/", views.api_registrar_metodo_pago, name="api_registrar_metodo_pago"),
    path("api/metodos-pago/<int:cod_metodo_pago>/desactivar/", views.api_desactivar_metodo_pago, name="api_desactivar_metodo_pago"),
    path("api/facturas/", views.api_facturas, name="api_facturas"),
    path("api/pagos/autorizar/", views.api_autorizar_pago, name="api_autorizar_pago"),
    path("api/pagos/capturar/", views.api_capturar_pago, name="api_capturar_pago"),
    path("api/prime/pagar/", views.api_pagar_membresia, name="api_pagar_membresia"),
    path("api/notificaciones/", views.api_notificaciones, name="api_notificaciones"),
    path("api/notificaciones/<int:cod_notificacion>/leer/", views.api_marcar_notificacion_leida, name="api_marcar_notificacion_leida"),
    path("api/soporte/tickets/", views.api_tickets_soporte, name="api_tickets_soporte"),
    path("api/soporte/tickets/crear/", views.api_crear_ticket, name="api_crear_ticket"),
    path("api/soporte/tickets/<int:cod_ticket>/responder/", views.api_responder_ticket, name="api_responder_ticket"),
    path("api/soporte/tickets/<int:cod_ticket>/cerrar/", views.api_cerrar_ticket, name="api_cerrar_ticket"),
]
