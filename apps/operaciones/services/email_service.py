from __future__ import annotations

import logging
from datetime import timedelta
from uuid import uuid4

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.db import connection, transaction
from django.template.loader import render_to_string
from django.utils import timezone

from apps.core.models import Usuario
from apps.core.services.sql_service import ejecutar_funcion_scalar
from apps.operaciones.models import ColaEmail, Factura
from apps.operaciones.services.factura_service import generar_factura_pdf

logger = logging.getLogger(__name__)


def encolar_email_transaccional(
    *, cod_usuario, destinatario, tipo, asunto, contexto=None,
    referencia_tipo=None, referencia_id=None, clave_idempotencia=None,
    cuerpo_texto="", cuerpo_html="",
):
    return ejecutar_funcion_scalar(
        "fn_encolar_email_transaccional",
        [
            cod_usuario, destinatario, tipo, asunto, cuerpo_texto, cuerpo_html,
            contexto or {}, referencia_tipo, referencia_id, clave_idempotencia,
            timezone.now(),
        ],
        [
            "BIGINT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "JSONB",
            "TEXT", "BIGINT", "TEXT", "TIMESTAMPTZ",
        ],
        usar_transaccion=True,
    )


def encolar_bienvenida(usuario: Usuario):
    return encolar_email_transaccional(
        cod_usuario=usuario.cod_usuario,
        destinatario=usuario.email,
        tipo="BIENVENIDA",
        asunto="Bienvenido a TechTail",
        contexto={"cod_usuario": usuario.cod_usuario},
        referencia_tipo="USUARIO",
        referencia_id=usuario.cod_usuario,
        clave_idempotencia=f"BIENVENIDA:{usuario.cod_usuario}",
    )


def encolar_reenvio_factura(cod_factura: int, cod_usuario: int):
    clave = f"FACTURA_REENVIO:{cod_factura}:{cod_usuario}:{uuid4().hex}"
    return ejecutar_funcion_scalar(
        "fn_encolar_email_factura",
        [cod_factura, clave],
        ["BIGINT", "TEXT"],
        usar_transaccion=True,
    )


def reclamar_lote(limite: int = 20) -> list[ColaEmail]:
    limite = max(1, min(int(limite), 100))
    with transaction.atomic(), connection.cursor() as cursor:
        cursor.execute(
            """
            WITH candidatos AS (
                SELECT cod_email
                FROM cola_email
                WHERE estado IN ('PENDIENTE', 'FALLIDO')
                  AND tipo <> 'WISHLIST_DESCUENTO'
                  AND (
                      procesando IS FALSE
                      OR fecha_inicio_proceso < now() - interval '15 minutes'
                  )
                  AND intentos < max_intentos
                  AND fecha_programada <= now()
                ORDER BY fecha_programada, cod_email
                FOR UPDATE SKIP LOCKED
                LIMIT %s
            )
            UPDATE cola_email ce
            SET procesando=TRUE, fecha_inicio_proceso=now()
            FROM candidatos c
            WHERE ce.cod_email=c.cod_email
            RETURNING ce.cod_email
            """,
            [limite],
        )
        ids = [row[0] for row in cursor.fetchall()]
    return list(ColaEmail.objects.filter(cod_email__in=ids).order_by("cod_email"))


def _contexto_email(email: ColaEmail) -> tuple[str, dict, Factura | None]:
    contexto = dict(email.contexto or {})
    contexto["frontend_base_url"] = settings.FRONTEND_BASE_URL
    factura = None
    if email.tipo == "FACTURA_EMITIDA":
        factura = Factura.objects.select_related("cod_pedido", "cod_pedido__cod_usuario").get(
            cod_factura=contexto.get("cod_factura") or email.referencia_id
        )
        usuario = factura.cod_pedido.cod_usuario
        contexto.update({
            "nombre": usuario.get_short_name(),
            "numero_factura": factura.numero_factura,
            "numero_pedido": factura.cod_pedido.numero_pedido,
            "fecha": factura.fecha_emision,
            "total": factura.total,
            "url_factura": f"{settings.FRONTEND_BASE_URL}/cuenta/facturas",
        })
        plantilla = "factura"
    elif email.tipo == "BIENVENIDA":
        usuario = Usuario.objects.get(cod_usuario=contexto.get("cod_usuario") or email.cod_usuario_id)
        contexto.update({
            "nombre": usuario.get_short_name(),
            "url_cuenta": f"{settings.FRONTEND_BASE_URL}/cuenta",
        })
        plantilla = "bienvenida"
    elif email.tipo.startswith("SOPORTE"):
        plantilla = "soporte"
        contexto.setdefault("url_soporte", f"{settings.FRONTEND_BASE_URL}/cuenta/soporte")
    else:
        plantilla = "generico"
        contexto.setdefault("mensaje", email.cuerpo_texto or email.cuerpo or email.asunto)
    return plantilla, contexto, factura


def enviar_email_encolado(email: ColaEmail):
    plantilla, contexto, factura = _contexto_email(email)
    texto = email.cuerpo_texto or render_to_string(f"emails/{plantilla}.txt", contexto)
    html = email.cuerpo_html or render_to_string(f"emails/{plantilla}.html", contexto)
    mensaje = EmailMultiAlternatives(
        subject=email.asunto,
        body=texto,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[email.destinatario],
    )
    mensaje.attach_alternative(html, "text/html")
    if factura:
        mensaje.attach(
            f"factura-{factura.numero_factura}.pdf",
            generar_factura_pdf(factura),
            "application/pdf",
        )
    mensaje.send(fail_silently=False)


def marcar_enviado(email: ColaEmail):
    ColaEmail.objects.filter(cod_email=email.cod_email).update(
        estado="ENVIADO", procesando=False, fecha_inicio_proceso=None,
        fecha_envio=timezone.now(), error_ultimo=None,
    )
    logger.info("EMAIL_SENT cod_email=%s tipo=%s", email.cod_email, email.tipo)


def marcar_fallido(email: ColaEmail, exc: Exception):
    intentos = email.intentos + 1
    proximo = timezone.now() + timedelta(minutes=min(60, 2 ** min(intentos, 5)))
    error_seguro = f"{exc.__class__.__name__}: {str(exc)[:400]}"
    ColaEmail.objects.filter(cod_email=email.cod_email).update(
        estado="FALLIDO", intentos=intentos, procesando=False,
        fecha_inicio_proceso=None, fecha_programada=proximo,
        error_ultimo=error_seguro,
    )
    logger.warning("EMAIL_FAILED cod_email=%s tipo=%s error=%s", email.cod_email, email.tipo, exc.__class__.__name__)
