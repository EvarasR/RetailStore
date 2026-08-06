from django.urls import path
from . import views

app_name = "core"

urlpatterns = [
    path("login/", views.login_view, name="login"),
    path("registro/", views.registro_view, name="registro"),
    path("logout/", views.logout_view, name="logout"),
    path("perfil/", views.perfil_view, name="perfil"),

    # APIs internas de sesión/perfil/direcciones.
    path("api/csrf/", views.api_csrf, name="api_csrf"),
    path("api/session/", views.api_session, name="api_session"),
    path("api/auth/login/", views.api_auth_login, name="api_auth_login"),
    path("api/auth/registro/", views.api_auth_registro, name="api_auth_registro"),
    path("api/auth/logout/", views.api_auth_logout, name="api_auth_logout"),
    path("api/perfil/", views.api_perfil, name="api_perfil"),
    path("api/perfil/actualizar/", views.api_actualizar_perfil, name="api_actualizar_perfil"),
    path("api/ubicaciones/", views.api_ubicaciones, name="api_ubicaciones"),
    path("api/direcciones/", views.api_direcciones, name="api_direcciones"),
    path("api/direcciones/crear/", views.api_crear_direccion, name="api_crear_direccion"),
    path("api/direcciones/<int:cod_direccion>/actualizar/", views.api_actualizar_direccion, name="api_actualizar_direccion"),
    path("api/direcciones/<int:cod_direccion>/eliminar/", views.api_eliminar_direccion, name="api_eliminar_direccion"),
    path("api/seguridad/password/", views.api_cambiar_password, name="api_cambiar_password"),
    path("api/seguridad/verificar-email/", views.api_verificar_email, name="api_verificar_email"),
]
