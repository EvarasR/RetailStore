from django.contrib import admin
from .models import Usuario


@admin.register(Usuario)
class UsuarioAdmin(admin.ModelAdmin):
    list_display = (
        "cod_usuario",
        "email",
        "nombres",
        "apellidos",
        "activo",
        "email_verificado",
        "is_staff",
    )

    search_fields = (
        "email",
        "nombres",
        "apellidos",
        "documento_identidad",
    )

    list_filter = (
        "activo",
        "email_verificado",
    )

    readonly_fields = (
        "cod_usuario",
        "password",
        "fecha_creacion",
        "fecha_actualizacion",
        "last_login",
    )

    fields = (
        "cod_usuario",
        "email",
        "password",
        "nombres",
        "apellidos",
        "telefono",
        "documento_identidad",
        "email_verificado",
        "activo",
        "fecha_creacion",
        "fecha_actualizacion",
        "last_login",
    )