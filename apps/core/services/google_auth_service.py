from __future__ import annotations

import secrets

from django.conf import settings
from django.db import transaction
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token

from apps.core.models import Usuario, UsuarioIdentidadExterna, UsuarioRol
from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void
from apps.core.services.usuario_service import crear_usuario_cliente


class GoogleAuthError(Exception):
    def __init__(self, code: str, message: str):
        self.code = code
        super().__init__(message)


def verificar_credencial_google(credential: str, nonce: str) -> dict:
    if not settings.GOOGLE_CLIENT_ID:
        raise GoogleAuthError("GOOGLE_NOT_CONFIGURED", "El acceso con Google aún no está configurado.")
    try:
        claims = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except Exception as exc:
        raise GoogleAuthError("GOOGLE_INVALID_TOKEN", "Google no pudo validar el inicio de sesión.") from exc
    if claims.get("iss") not in {"accounts.google.com", "https://accounts.google.com"}:
        raise GoogleAuthError("GOOGLE_INVALID_TOKEN", "El proveedor de identidad no es válido.")
    if not claims.get("email_verified"):
        raise GoogleAuthError("GOOGLE_EMAIL_NOT_VERIFIED", "Google no confirmó el correo de esta cuenta.")
    if not claims.get("sub") or not claims.get("email"):
        raise GoogleAuthError("GOOGLE_INVALID_TOKEN", "Google no devolvió una identidad válida.")
    if not secrets.compare_digest(str(claims.get("nonce") or ""), nonce):
        raise GoogleAuthError("GOOGLE_INVALID_STATE", "La validación de seguridad de Google expiró.")
    return claims


def _vincular(usuario: Usuario, claims: dict, onboarding_completo: bool = True):
    subject_owner = UsuarioIdentidadExterna.objects.filter(
        proveedor="GOOGLE", provider_subject=claims["sub"]
    ).first()
    if subject_owner and subject_owner.cod_usuario_id != usuario.cod_usuario:
        raise GoogleAuthError("GOOGLE_ALREADY_LINKED", "Esta cuenta Google ya está vinculada a otro usuario.")
    other_active = UsuarioIdentidadExterna.objects.filter(
        cod_usuario=usuario, proveedor="GOOGLE", activo=True
    ).exclude(provider_subject=claims["sub"]).exists()
    if other_active:
        raise GoogleAuthError("GOOGLE_ALREADY_LINKED", "La cuenta TechTail ya tiene otra identidad Google vinculada.")
    return ejecutar_funcion_scalar(
        "fn_vincular_identidad_google",
        [usuario.cod_usuario, claims["sub"], claims["email"], onboarding_completo],
        ["BIGINT", "TEXT", "TEXT", "BOOLEAN"],
        usar_transaccion=True,
    )


def resolver_identidad_google(claims: dict, usuario_actual=None, vincular=False):
    subject = claims["sub"]
    email = claims["email"].strip().lower()
    identidad = UsuarioIdentidadExterna.objects.select_related("cod_usuario").filter(
        proveedor="GOOGLE", provider_subject=subject, activo=True
    ).first()
    if identidad:
        if vincular and usuario_actual and identidad.cod_usuario_id != usuario_actual.cod_usuario:
            raise GoogleAuthError("GOOGLE_ALREADY_LINKED", "Esta cuenta Google ya está vinculada a otro usuario.")
        if not identidad.cod_usuario.activo:
            raise GoogleAuthError("ACCOUNT_INACTIVE", "La cuenta TechTail está inactiva.")
        return identidad.cod_usuario, False

    if vincular:
        if not usuario_actual or not usuario_actual.is_authenticated:
            raise GoogleAuthError("ACCOUNT_REQUIRED", "Inicia sesión para vincular Google.")
        _vincular(usuario_actual, claims)
        if not usuario_actual.email_verificado:
            Usuario.objects.filter(pk=usuario_actual.pk).update(email_verificado=True)
        return usuario_actual, False

    usuario = Usuario.objects.filter(email__iexact=email).first()
    if usuario:
        if not usuario.activo:
            raise GoogleAuthError("ACCOUNT_INACTIVE", "La cuenta TechTail está inactiva.")
        roles_sensibles = UsuarioRol.objects.filter(
            cod_usuario=usuario,
            cod_rol__nombre__in={"ADMIN", "WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT"},
        ).exists()
        if roles_sensibles and (not usuario_actual or usuario_actual.pk != usuario.pk):
            raise GoogleAuthError(
                "GOOGLE_LINK_REQUIRED",
                "Por seguridad, inicia sesión con tu contraseña y vincula Google desde tu cuenta.",
            )
        _vincular(usuario, claims)
        if not usuario.email_verificado:
            Usuario.objects.filter(pk=usuario.pk).update(email_verificado=True)
        return usuario, False

    nombres = (claims.get("given_name") or "").strip()
    apellidos = (claims.get("family_name") or "").strip()
    if not nombres or not apellidos:
        return None, True

    with transaction.atomic():
        cod_usuario = crear_usuario_cliente(
            email, secrets.token_urlsafe(48), nombres, apellidos, None, None
        )
        usuario = Usuario.objects.get(cod_usuario=cod_usuario)
        usuario.set_unusable_password()
        usuario.email_verificado = True
        usuario.save(update_fields=["password", "email_verificado"])
        _vincular(usuario, claims)
    return usuario, True


def completar_registro_google(claims: dict, nombres: str, apellidos: str, telefono=None, documento=None):
    nombres = nombres.strip()
    apellidos = apellidos.strip()
    if not nombres or not apellidos:
        raise GoogleAuthError("ONBOARDING_REQUIRED", "Completa nombres y apellidos.")
    email = claims["email"].strip().lower()
    if Usuario.objects.filter(email__iexact=email).exists():
        raise GoogleAuthError("GOOGLE_ALREADY_LINKED", "La cuenta ya existe. Inicia sesión para vincularla.")
    with transaction.atomic():
        cod_usuario = crear_usuario_cliente(
            email, secrets.token_urlsafe(48), nombres, apellidos,
            (telefono or "").strip() or None,
            (documento or "").strip() or None,
        )
        usuario = Usuario.objects.get(cod_usuario=cod_usuario)
        usuario.set_unusable_password()
        usuario.email_verificado = True
        usuario.save(update_fields=["password", "email_verificado"])
        _vincular(usuario, claims, onboarding_completo=True)
    return usuario


def desvincular_google(usuario: Usuario):
    if not usuario.has_usable_password():
        raise GoogleAuthError(
            "PASSWORD_REQUIRED",
            "Configura una contraseña antes de desvincular Google.",
        )
    ejecutar_funcion_void(
        "fn_desvincular_identidad_google",
        [usuario.cod_usuario],
        ["BIGINT"],
    )
