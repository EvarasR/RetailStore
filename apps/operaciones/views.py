import uuid
import json
from decimal import Decimal

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.http import require_GET, require_POST

from apps.core.models import PreferenciaNotificacion
from apps.operaciones.models import CuentaSimulada, Envio, Factura, MetodoEnvio, MetodoPago, Notificacion, Pedido, SoporteTicket, SoporteTicketMensaje, TransaccionPago
from apps.operaciones.services.email_service import encolar_reenvio_factura
from apps.operaciones.services.factura_service import facturas_visibles_para, generar_factura_pdf, obtener_factura_visible
from apps.operaciones.services.notificacion_service import marcar_notificacion_leida
from apps.operaciones.services.pago_service import (
    autorizar_pago_simulado,
    capturar_pago_simulado,
    registrar_metodo_pago_simulado,
    pagar_activar_membresia_simulada,
)
from apps.clientes.services.soporte_service import (
    cerrar_ticket_soporte,
    crear_ticket_soporte,
    responder_ticket_soporte,
)


def _json_ok(**data):
    payload = {"ok": True}
    payload.update(data)
    return JsonResponse(payload)


def _json_error(mensaje, status=400, **extra):
    payload = {"ok": False, "mensaje": mensaje}
    payload.update(extra)
    return JsonResponse(payload, status=status)


def _safe_error(exc, mensaje="No se pudo completar la operación."):
    return str(exc) if settings.DEBUG else mensaje


def _money(value):
    if value is None:
        return "0.00"
    if isinstance(value, Decimal):
        return f"{value:.2f}"
    return str(value)


def _factura_data(factura):
    return {
        "cod_factura": factura.cod_factura,
        "cod_pedido": factura.cod_pedido_id,
        "numero_factura": factura.numero_factura,
        "numero_pedido": factura.cod_pedido.numero_pedido,
        "subtotal": _money(factura.subtotal),
        "descuento": _money(factura.descuento),
        "impuesto": _money(factura.impuesto),
        "tasa_impuesto": _money(factura.tasa_impuesto),
        "costo_envio": _money(factura.costo_envio),
        "total": _money(factura.total),
        "estado": factura.estado,
        "fecha_emision": _dt(factura.fecha_emision),
        "pdf_url": f"/operaciones/api/facturas/{factura.cod_factura}/pdf/",
        "detalle_url": f"/operaciones/api/facturas/{factura.cod_factura}/",
    }


def _dt(value):
    return value.isoformat() if value else None


@require_GET
def api_metodos_envio(request):
    metodos = MetodoEnvio.objects.filter(activo=True).order_by("costo_base")
    return _json_ok(
        metodos=[
            {
                "cod_metodo_envio": m.cod_metodo_envio,
                "nombre": m.nombre,
                "dias_min": m.dias_min,
                "dias_max": m.dias_max,
                "costo_base": _money(m.costo_base),
                "es_premium_gratis": m.es_premium_gratis,
            }
            for m in metodos
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_metodos_pago(request):
    metodos = MetodoPago.objects.filter(cod_usuario=request.user, activo=True).order_by("-fecha_creacion")
    return _json_ok(
        metodos=[
            {
                "cod_metodo_pago": m.cod_metodo_pago,
                "tipo": m.tipo,
                "marca": m.marca,
                "bin6": m.bin6,
                "ultimos4": m.ultimos4,
                "titular": m.titular,
                "exp_mes": m.exp_mes,
                "exp_anio": m.exp_anio,
                "fecha_creacion": _dt(m.fecha_creacion),
                "saldo_disponible": _money(getattr(m, "cuentasimulada", None).saldo_disponible) if hasattr(m, "cuentasimulada") else None,
                "limite_diario": _money(getattr(m, "cuentasimulada", None).limite_diario) if hasattr(m, "cuentasimulada") else None,
                "monto_usado_hoy": _money(getattr(m, "cuentasimulada", None).monto_usado_hoy) if hasattr(m, "cuentasimulada") else None,
                "bloqueada": getattr(getattr(m, "cuentasimulada", None), "bloqueada", False) if hasattr(m, "cuentasimulada") else False,
            }
            for m in metodos
        ]
    )


@login_required(login_url="/login/")
@require_POST
def api_desactivar_metodo_pago(request, cod_metodo_pago):
    metodo = MetodoPago.objects.filter(cod_metodo_pago=cod_metodo_pago, cod_usuario=request.user, activo=True).first()
    if not metodo:
        return _json_error("Método de pago no encontrado.", status=404)
    metodo.activo = False
    metodo.save(update_fields=["activo"])
    return _json_ok(mensaje="Método de pago eliminado de tu cuenta.")


@login_required(login_url="/login/")
@require_GET
def api_facturas(request):
    facturas = facturas_visibles_para(request.user).order_by("-fecha_emision")[:100]
    return _json_ok(
        facturas=[_factura_data(f) for f in facturas]
    )


@login_required(login_url="/login/")
@require_GET
def api_factura_detalle(request, cod_factura):
    factura = obtener_factura_visible(request.user, cod_factura)
    if not factura:
        return _json_error("Factura no encontrada.", status=404)
    return _json_ok(factura=_factura_data(factura))


@login_required(login_url="/login/")
@require_GET
def api_factura_pdf(request, cod_factura):
    factura = obtener_factura_visible(request.user, cod_factura)
    if not factura:
        return _json_error("Factura no encontrada.", status=404)
    pdf = generar_factura_pdf(factura)
    response = HttpResponse(pdf, content_type="application/pdf")
    disposition = "attachment" if request.GET.get("download") == "1" else "inline"
    response["Content-Disposition"] = f'{disposition}; filename="factura-{factura.numero_factura}.pdf"'
    response["Cache-Control"] = "private, no-store"
    response["X-Content-Type-Options"] = "nosniff"
    return response


@login_required(login_url="/login/")
@require_POST
def api_reenviar_factura(request, cod_factura):
    factura = obtener_factura_visible(request.user, cod_factura)
    if not factura:
        return _json_error("Factura no encontrada.", status=404)
    if factura.cod_pedido.cod_usuario_id != request.user.cod_usuario:
        return _json_error("El reenvío manual solo está disponible para el titular.", status=403)
    rate_key = f"reenviar_factura_{cod_factura}"
    ultimo = request.session.get(rate_key)
    ahora = timezone.now().timestamp()
    if ultimo and ahora - float(ultimo) < 60:
        return _json_error("Espera un minuto antes de volver a solicitar el envío.", status=429)
    encolar_reenvio_factura(factura.cod_factura, request.user.cod_usuario)
    request.session[rate_key] = ahora
    return _json_ok(mensaje="La factura fue encolada para enviarse a tu correo registrado.")


@login_required(login_url="/login/")
def api_preferencias_notificacion(request):
    preferencia = PreferenciaNotificacion.objects.filter(cod_usuario=request.user).first()
    defaults = {
        "notificaciones_web": True,
        "emails_pedidos": True,
        "emails_prime": True,
        "emails_soporte": True,
    }
    if request.method == "GET":
        if preferencia:
            defaults = {key: getattr(preferencia, key) for key in defaults}
        return _json_ok(preferencias=defaults)
    if request.method != "POST":
        return _json_error("Método no permitido.", status=405)

    def value(name):
        return request.POST.get(name) in ("1", "true", "on", "True")

    from apps.core.services.sql_service import ejecutar_funcion_void
    ejecutar_funcion_void(
        "fn_actualizar_preferencias_notificacion",
        [
            request.user.cod_usuario,
            value("notificaciones_web"),
            value("emails_pedidos"),
            False,
            value("emails_prime"),
            value("emails_soporte"),
        ],
        ["BIGINT", "BOOLEAN", "BOOLEAN", "BOOLEAN", "BOOLEAN", "BOOLEAN"],
    )
    return _json_ok(mensaje="Preferencias actualizadas.", preferencias={name: value(name) for name in defaults})


@login_required(login_url="/login/")
@sensitive_post_parameters("numero_tarjeta", "cvv")
@require_POST
def api_registrar_metodo_pago(request):
    try:
        numero_tarjeta = "".join(ch for ch in (request.POST.get("numero_tarjeta") or "") if ch.isdigit())
        cvv = "".join(ch for ch in (request.POST.get("cvv") or "") if ch.isdigit())
        exp_mes = int(request.POST.get("exp_mes") or 0)
        exp_anio = int(request.POST.get("exp_anio") or 0)

        if not 12 <= len(numero_tarjeta) <= 19:
            return _json_error("Número de tarjeta inválido.", status=400)
        if not 1 <= exp_mes <= 12:
            return _json_error("Mes de vencimiento inválido.", status=400)
        if len(cvv) not in (3, 4):
            return _json_error("CVV inválido.", status=400)

        cod = registrar_metodo_pago_simulado(
            request.user.cod_usuario,
            numero_tarjeta,
            request.POST.get("titular") or request.user.get_full_name() or request.user.email,
            exp_mes,
            exp_anio,
            cvv,
            request.POST.get("saldo_disponible") or 1000,
            request.POST.get("limite_diario") or 1000,
        )
        return _json_ok(mensaje="Método de pago registrado.", cod_metodo_pago=cod)
    except ValueError:
        return _json_error("Datos de tarjeta inválidos.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo registrar el método de pago."), status=500)


@login_required(login_url="/login/")
@sensitive_post_parameters("idempotency_key")
@require_POST
def api_autorizar_pago(request):
    try:
        cod_pedido = int(request.POST.get("cod_pedido"))
        cod_metodo_pago = int(request.POST.get("cod_metodo_pago"))

        pedido_ok = Pedido.objects.filter(cod_pedido=cod_pedido, cod_usuario=request.user).exists()
        if not pedido_ok:
            return _json_error("Pedido no encontrado para este usuario.", status=404)

        metodo_ok = MetodoPago.objects.filter(
            cod_metodo_pago=cod_metodo_pago,
            cod_usuario=request.user,
            activo=True,
        ).exists()
        if not metodo_ok:
            return _json_error("Método de pago inválido para este usuario.", status=403)

        idem = (request.POST.get("idempotency_key") or "").strip()
        if not idem or len(idem) > 120:
            return _json_error("Debes enviar idempotency_key para autorizar el pago.", status=400)
        cod_transaccion = autorizar_pago_simulado(cod_pedido, cod_metodo_pago, idem)
        tx = TransaccionPago.objects.filter(cod_transaccion=cod_transaccion, cod_pedido__cod_usuario=request.user).first()
        if not tx:
            return _json_error("No se pudo leer la transacción generada.", status=500)
        if tx.cod_estado_pago_id != "AUTORIZADO":
            return _json_error(tx.mensaje or "Pago rechazado por la pasarela simulada.", status=402, cod_transaccion=cod_transaccion)
        return _json_ok(mensaje=tx.mensaje or "Pago autorizado.", cod_transaccion=cod_transaccion, estado_pago=tx.cod_estado_pago_id, monto=_money(tx.monto))
    except ValueError:
        return _json_error("Datos de pago inválidos.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo autorizar el pago."), status=500)


@login_required(login_url="/login/")
@require_POST
def api_capturar_pago(request):
    try:
        cod_transaccion = int(request.POST.get("cod_transaccion"))
        tx = get_object_or_404(TransaccionPago, cod_transaccion=cod_transaccion, cod_pedido__cod_usuario=request.user)
        capturar_pago_simulado(tx.cod_transaccion)
        factura = Factura.objects.filter(cod_pedido=tx.cod_pedido).first()
        envio = Envio.objects.filter(cod_pedido=tx.cod_pedido).first()
        return _json_ok(
            mensaje="Pago capturado. Pedido confirmado.",
            cod_pedido=tx.cod_pedido_id,
            numero_pedido=tx.cod_pedido.numero_pedido,
            numero_factura=factura.numero_factura if factura else None,
            factura={
                "numero_factura": factura.numero_factura,
                "subtotal": _money(factura.subtotal),
                "descuento": _money(factura.descuento),
                "impuesto": _money(factura.impuesto),
                "costo_envio": _money(factura.costo_envio),
                "total": _money(factura.total),
            } if factura else None,
            tracking={
                "numero_tracking": envio.numero_tracking,
                "estado": envio.estado_envio or envio.estado,
            } if envio else None,
        )
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)



@login_required(login_url="/login/")
@require_POST
def api_pagar_membresia(request):
    try:
        cod_plan = int(request.POST.get("cod_plan"))
        cod_metodo_pago = int(request.POST.get("cod_metodo_pago"))
        renovacion = request.POST.get("renovacion_automatica", "true") in ("true", "on", "1")
        metodo_ok = MetodoPago.objects.filter(
            cod_metodo_pago=cod_metodo_pago,
            cod_usuario=request.user,
            activo=True,
        ).exists()
        if not metodo_ok:
            return _json_error("Método de pago inválido para este usuario.", status=403)
        resultado = pagar_activar_membresia_simulada(
            request.user.cod_usuario,
            cod_plan,
            cod_metodo_pago,
            request.POST.get("idempotency_key") or str(uuid.uuid4()),
            renovacion,
        )
        if isinstance(resultado, str):
            resultado = json.loads(resultado)
        if not isinstance(resultado, dict):
            resultado = {"ok": False, "mensaje": "Respuesta de membresía inválida."}
        if not resultado.get("ok"):
            return _json_error(resultado.get("mensaje") or "Pago Prime rechazado.", status=402, resultado=resultado)
        return _json_ok(mensaje=resultado.get("mensaje") or "Prime activado.", resultado=resultado)
    except ValueError:
        return _json_error("Datos de membresía inválidos.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo pagar la membresía Prime."), status=500)


@login_required(login_url="/login/")
@require_GET
def api_notificaciones(request):
    notificaciones = Notificacion.objects.filter(cod_usuario=request.user).order_by("-fecha_creacion")[:30]
    return _json_ok(
        notificaciones=[
            {
                "cod_notificacion": n.cod_notificacion,
                "tipo": n.tipo,
                "titulo": n.titulo,
                "mensaje": n.mensaje,
                "url_accion": n.url_accion,
                "leida": n.leida,
                "fecha": _dt(n.fecha_creacion),
                "referencia_tipo": n.referencia_tipo,
                "referencia_id": n.referencia_id,
                "cod_producto": n.cod_producto_id,
            }
            for n in notificaciones
        ]
    )


@login_required(login_url="/login/")
@require_POST
def api_marcar_notificacion_leida(request, cod_notificacion):
    notif = Notificacion.objects.filter(cod_notificacion=cod_notificacion, cod_usuario=request.user).first()
    if not notif:
        return _json_error("Notificación no encontrada.", status=404)
    try:
        marcar_notificacion_leida(cod_notificacion)
        return _json_ok(mensaje="Notificación marcada como leída.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_tickets_soporte(request):
    tickets = SoporteTicket.objects.filter(cod_usuario=request.user).order_by("-fecha_creacion")[:30]
    mensajes = {}
    for m in SoporteTicketMensaje.objects.filter(cod_ticket__cod_usuario=request.user, interno=False).select_related("cod_usuario").order_by("fecha_creacion"):
        mensajes.setdefault(m.cod_ticket_id, []).append({
            "cod_mensaje": m.cod_ticket_mensaje,
            "autor": m.cod_usuario.get_full_name() if m.cod_usuario else "Equipo TechTail",
            "mensaje": m.mensaje,
            "fecha": _dt(m.fecha_creacion),
        })
    return _json_ok(
        tickets=[
            {
                "cod_ticket": t.cod_ticket,
                "asunto": t.asunto,
                "categoria": t.categoria,
                "prioridad": t.prioridad,
                "estado": t.estado,
                "fecha": _dt(t.fecha_creacion),
                "mensajes": mensajes.get(t.cod_ticket, []),
            }
            for t in tickets
        ]
    )


@login_required(login_url="/login/")
@require_POST
def api_crear_ticket(request):
    try:
        cod = crear_ticket_soporte(
            request.user.cod_usuario,
            request.POST.get("asunto") or "Consulta",
            request.POST.get("categoria") or "GENERAL",
            request.POST.get("prioridad") or "MEDIA",
            request.POST.get("mensaje") or "",
        )
        return _json_ok(mensaje="Ticket creado.", cod_ticket=cod)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_responder_ticket(request, cod_ticket):
    ticket = get_object_or_404(SoporteTicket, cod_ticket=cod_ticket, cod_usuario=request.user)
    try:
        cod = responder_ticket_soporte(ticket.cod_ticket, request.user.cod_usuario, request.POST.get("mensaje") or "")
        return _json_ok(mensaje="Respuesta enviada.", cod_ticket_mensaje=cod)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_cerrar_ticket(request, cod_ticket):
    ticket = get_object_or_404(SoporteTicket, cod_ticket=cod_ticket, cod_usuario=request.user)
    try:
        cerrar_ticket_soporte(ticket.cod_ticket, request.user.cod_usuario, request.POST.get("mensaje") or "Ticket cerrado por el cliente")
        return _json_ok(mensaje="Ticket cerrado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)
