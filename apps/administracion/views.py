import json
from decimal import Decimal
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.files.storage import default_storage
from django.db import transaction
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from apps.administracion.models import (
    AlertaStock,
    Almacen,
    Categoria,
    Cupon,
    CuponUso,
    Inventario,
    LoteInventario,
    LogBusqueda,
    LogCarritoAbandonado,
    LogProductoVisto,
    Marca,
    MovimientoInventario,
    Producto,
    ProductoAtributo,
    ProductoAtributoValor,
    ProductoImagen,
    ProductoRelacionado,
    ProductoResena,
    Promocion,
    PromocionProducto,
    ReglaLimiteCompra,
    ReservaInventario,
    ResumenVentaDiaria,
    SegmentoCliente,
    SnapshotKpi,
)
from apps.administracion.services import control_service
from apps.administracion.services.producto_service import (
    actualizar_categoria,
    actualizar_marca,
    agregar_imagen_producto,
    actualizar_imagen_producto,
    desactivar_imagen_producto,
    ordenar_imagen_producto,
    crear_categoria,
    crear_marca,
    crear_producto,
    actualizar_producto,
    crear_regla_precio,
    crear_producto_atributo,
    actualizar_producto_atributo,
    desactivar_producto_atributo,
    asignar_producto_atributo_valor,
    desasociar_producto_atributo_valor,
    actualizar_regla_precio,
    desactivar_regla_precio,
    desactivar_producto,
    eliminar_categoria_logica,
    eliminar_marca_logica,
    pausar_producto,
    publicar_producto,
    recalcular_precio_desde_producto,
    stock_disponible_producto,
    stock_proveedor_disponible_producto,
    validar_producto_publicable,
)
from apps.administracion.services.inventario_service import (
    ajustar_inventario,
    crear_almacen,
    crear_lote_inventario,
    expirar_reservas_vencidas,
    generar_reposicion_automatica,
    liberar_reservas_pedido,
    recalcular_inventario_desde_lotes,
    registrar_movimiento_inventario,
    resolver_alerta_stock,
)
from apps.administracion.services.promocion_service import (
    actualizar_cupon,
    actualizar_promocion,
    asociar_promocion_producto,
    crear_cupon,
    crear_promocion,
    desactivar_cupon,
    desactivar_promocion,
)
from apps.administracion.services import panel_service
from apps.clientes.models import Carrito, ProductoPregunta, ProductoRespuesta
from apps.clientes.services.membresia_service import (
    actualizar_beneficio_membresia,
    crear_plan_membresia,
    crear_beneficio_membresia,
    desactivar_plan_membresia,
    desactivar_beneficio_membresia,
)
from apps.core.models import Auditoria, EstadoPedido, IntentoLogin, Permiso, Rol, RolPermiso, Usuario, UsuarioRol
from apps.core.services import usuario_service
from apps.operaciones.models import ColaEmail, Devolucion, MetodoEnvio, Notificacion, Pedido, SoporteTicket, SoporteTicketMensaje, Transportista, ZonaEntrega
from apps.clientes.services.soporte_service import responder_ticket_soporte
from apps.clientes.services.checkout_service import aprobar_devolucion
from apps.operaciones.services.notificacion_service import crear_notificacion
from apps.operaciones.services.pago_service import generar_reembolso_simulado
from apps.operaciones.services.tracking_service import (
    actualizar_envio_estado,
    procesar_tracking_pendiente,
)
from apps.proveedores.models import HistorialProveedor, ProductoProveedor, Proveedor, ProveedorContacto, ProveedorStock
from apps.proveedores.services.proveedor_service import (
    actualizar_stock_proveedor,
    actualizar_proveedor,
    asociar_producto_proveedor,
    cancelar_orden_abastecimiento,
    crear_contacto_proveedor,
    crear_proveedor,
    asociar_usuario_proveedor,
    desasociar_usuario_proveedor,
    desasociar_producto_proveedor,
    eliminar_proveedor_logico,
    recibir_orden_abastecimiento,
)
from apps.clientes.services.checkout_service import actualizar_estado_pedido


def _json_ok(**data):
    payload = {"ok": True}
    payload.update(data)
    return JsonResponse(payload)


def _json_error(mensaje, status=400):
    return JsonResponse({"ok": False, "mensaje": mensaje}, status=status)


def _safe_error(exc, mensaje="No se pudo completar la operación."):
    return str(exc) if settings.DEBUG else mensaje


def _money(value):
    if value is None:
        return "0.00"
    if isinstance(value, Decimal):
        return f"{value:.2f}"
    return str(value)


def _dt(value):
    return value.isoformat() if value else None


def _post_int(request, key, required=True):
    value = request.POST.get(key)
    if value in (None, ""):
        if required:
            raise ValueError(f"El campo {key} es obligatorio.")
        return None
    return int(value)


def _post_decimal(request, key, required=True):
    value = request.POST.get(key)
    if value in (None, ""):
        if required:
            raise ValueError(f"El campo {key} es obligatorio.")
        return None
    return Decimal(value)


def _post_bool(request, key, default=False):
    value = request.POST.get(key)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "si", "sí", "on"}


def _validar_url_imagen(url):
    url = (url or "").strip()
    parsed = urlparse(url)
    if len(url) > 2048:
        raise ValueError("La URL de imagen es demasiado larga.")
    if url.startswith((settings.MEDIA_URL, settings.STATIC_URL)):
        return url
    if parsed.scheme not in ("http", "https"):
        raise ValueError("La imagen debe usar una URL HTTP(S) válida.")
    if not parsed.netloc:
        raise ValueError("La URL de imagen no contiene host.")
    return url


def _guardar_archivo_producto(archivo, cod_producto, tipo):
    reglas = {
        "IMAGEN": ({".jpg", ".jpeg", ".png", ".webp", ".gif"}, 8 * 1024 * 1024, "imagenes"),
        "VIDEO": ({".mp4", ".webm", ".mov", ".m4v"}, 60 * 1024 * 1024, "videos"),
        "FICHA": ({".pdf"}, 15 * 1024 * 1024, "fichas"),
    }
    extensiones, maximo, carpeta = reglas[tipo]
    extension = Path(archivo.name or "").suffix.lower()
    if extension not in extensiones:
        raise ValueError(f"Formato no permitido para {tipo.lower()}.")
    if archivo.size > maximo:
        raise ValueError(f"El archivo de {tipo.lower()} supera el tamaño permitido.")
    nombre = f"productos/{int(cod_producto)}/{carpeta}/{uuid4().hex}{extension}"
    ruta = default_storage.save(nombre, archivo)
    return f"{settings.MEDIA_URL.rstrip('/')}/{ruta.replace(chr(92), '/')}"


def _eliminar_archivo_producto_local(url):
    """Revierte un archivo guardado si la creación integral no se completa."""
    prefijo = settings.MEDIA_URL.rstrip("/") + "/"
    if url and url.startswith(prefijo):
        default_storage.delete(url[len(prefijo):])


def _diagnostico_publicacion(producto, stock_calculado=None):
    """Explica todos los requisitos pendientes, no solamente el primero."""
    faltantes = []
    metadata = producto.metadata if isinstance(producto.metadata, dict) else {}
    ficha = metadata.get("ficha_tecnica") or {}
    ficha_url = str(ficha.get("url") or "")
    if not producto.cod_categoria_id:
        faltantes.append("Asignar una categoría")
    if not producto.cod_marca_id:
        faltantes.append("Asignar una marca")
    if not (producto.sku or "").strip():
        faltantes.append("Definir un SKU único")
    if not producto.precio_actual or producto.precio_actual <= 0:
        faltantes.append("Definir un precio válido")
    if not ProductoImagen.objects.filter(cod_producto=producto, es_principal=True, activo=True).exists():
        faltantes.append("Agregar una imagen principal")
    if not ficha_url.lower().split("?", 1)[0].endswith(".pdf"):
        faltantes.append("Adjuntar la ficha técnica en PDF")
    if not ReglaLimiteCompra.objects.filter(cod_producto=producto, activo=True).exists():
        faltantes.append("Configurar el límite retail")
    proveedores = ProductoProveedor.objects.filter(cod_producto=producto, activo=True).count()
    if proveedores < 5:
        faltantes.append(f"Asociar al menos 5 proveedores activos ({proveedores}/5)")
    if stock_calculado is None:
        try:
            stock_calculado = (stock_disponible_producto(producto.pk) or 0) + (stock_proveedor_disponible_producto(producto.pk) or 0)
        except Exception:
            stock_calculado = 0
    if int(stock_calculado or 0) <= 0:
        faltantes.append("Registrar stock propio o disponible en proveedores")
    total = 8
    completados = max(0, total - len(faltantes))
    return {"publicable": not faltantes, "faltantes": faltantes, "completitud": round(completados * 100 / total)}


def _es_admin(user):
    return user.is_authenticated and getattr(user, "is_staff", False)


def _roles_usuario(user):
    if not user.is_authenticated:
        return set()
    return set(UsuarioRol.objects.filter(cod_usuario=user, cod_rol__activo=True).values_list("cod_rol__nombre", flat=True))


def _tiene_rol(user, *roles):
    return _es_admin(user) or bool(_roles_usuario(user).intersection(roles))


def _exigir_roles(request, *roles):
    if not _tiene_rol(request.user, *roles):
        return _json_error("No tienes permisos para esta operación.", status=403)
    return None


def _exigir_admin(request):
    if not _es_admin(request.user):
        return _json_error("No tienes permisos para esta operación.", status=403)
    return None


def _imagen_producto(cod_producto):
    img = ProductoImagen.objects.filter(cod_producto_id=cod_producto, es_principal=True).first()
    if not img:
        img = ProductoImagen.objects.filter(cod_producto_id=cod_producto).order_by("orden").first()
    return img.url_imagen if img else ""


@login_required(login_url="/login/")
@ensure_csrf_cookie
def panel_view(request):
    roles = _roles_usuario(request.user)
    operativos = {"WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT"}
    if not (_es_admin(request.user) or roles.intersection(operativos)):
        return redirect("clientes:inicio")
    rol_principal = "ADMIN" if _es_admin(request.user) else next((r for r in ("WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT") if r in roles), "OPERADOR")
    return render(request, "administracion/panel.html", {"sin_permiso": False, "roles_panel": sorted(roles), "rol_principal": rol_principal, "es_admin_panel": _es_admin(request.user)})


@login_required(login_url="/login/")
@require_GET
def api_resumen(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT")
    if error:
        return error

    resumen = panel_service.resumen_panel()
    tarjetas = resumen["tarjetas"]
    estados = resumen["estados_pedido"]
    ventas_dias = resumen["ventas_diarias"]
    kpis = resumen["kpis"]
    if not _es_admin(request.user):
        ventas_dias = []
        kpis = []

    return _json_ok(
        tarjetas={
            "productos": tarjetas["productos"],
            "productos_publicados": tarjetas["productos_publicados"],
            "pedidos": tarjetas["pedidos"],
            "ventas": _money(tarjetas["ventas"] if _es_admin(request.user) else 0),
            "clientes": tarjetas["clientes"],
            "proveedores": tarjetas["proveedores"],
            "alertas_stock": tarjetas["alertas_stock"],
            "carritos_activos": Carrito.objects.filter(estado="ACTIVO").count(),
        },
        estados_pedido=[{"estado": e["cod_estado_pedido_id"], "total": e["total"]} for e in estados],
        ventas_diarias=[
            {
                "fecha": v.fecha.isoformat(),
                "total_pedidos": v.total_pedidos,
                "total_ventas": _money(v.total_ventas),
                "ticket_promedio": _money(v.ticket_promedio),
            }
            for v in reversed(list(ventas_dias))
        ],
        kpis=[
            {
                "nombre": k.nombre_kpi,
                "valor": _money(k.valor),
                "unidad": k.unidad,
                "fecha": _dt(k.fecha_snapshot),
            }
            for k in kpis
        ],
    )


@login_required(login_url="/login/")
@require_GET
def api_productos_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT")
    if error:
        return error

    q = (request.GET.get("q") or "").strip()
    estado = request.GET.get("estado") or ""
    qs = Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto").order_by("-fecha_creacion")
    if q:
        qs = qs.filter(nombre__icontains=q)
    if estado:
        qs = qs.filter(cod_estado_producto_id=estado)
    qs = qs[:80]

    productos = []
    for p in qs:
        try:
            stock = (stock_disponible_producto(p.cod_producto) or 0) + (stock_proveedor_disponible_producto(p.cod_producto) or 0)
        except Exception:
            stock = None
        diagnostico = _diagnostico_publicacion(p, stock)
        productos.append({
            "cod_producto": p.cod_producto,
            "sku": p.sku,
            "nombre": p.nombre,
            "descripcion": p.descripcion,
            "cod_categoria": p.cod_categoria_id,
            "categoria": p.cod_categoria.nombre,
            "cod_marca": p.cod_marca_id,
            "marca": p.cod_marca.nombre,
            "precio": _money(p.precio_actual),
            "peso_kg": _money(p.peso_kg),
            "largo_cm": _money(p.largo_cm),
            "ancho_cm": _money(p.ancho_cm),
            "alto_cm": _money(p.alto_cm),
            "estado": p.cod_estado_producto_id,
            "stock": stock,
            "imagen": _imagen_producto(p.cod_producto),
            "publicable": diagnostico["publicable"],
            "faltantes": diagnostico["faltantes"],
            "completitud": diagnostico["completitud"],
            "fecha": _dt(p.fecha_creacion),
        })

    return _json_ok(productos=productos)


@login_required(login_url="/login/")
@require_POST
def api_publicar_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        producto = Producto.objects.get(pk=cod_producto)
        diagnostico = _diagnostico_publicacion(producto)
        if not diagnostico["publicable"]:
            return _json_error("Aún no se puede publicar: " + "; ".join(diagnostico["faltantes"]), status=400)
        publicar_producto(cod_producto)
        return _json_ok(mensaje="Producto publicado.")
    except Producto.DoesNotExist:
        return _json_error("Producto no encontrado.", status=404)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_pausar_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        pausar_producto(cod_producto)
        return _json_ok(mensaje="Producto pausado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_desactivar_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        desactivar_producto(cod_producto)
        return _json_ok(mensaje="Producto desactivado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_inventario(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error

    inventario = panel_service.listar_inventario()
    return _json_ok(
        inventario=[
            {
                "cod_producto": i.cod_producto.cod_producto,
                "producto": i.cod_producto.nombre,
                "almacen": i.cod_almacen.nombre,
                "stock_total": i.stock_total,
                "stock_reservado": i.stock_reservado,
                "stock_disponible": i.stock_total - i.stock_reservado,
                "stock_minimo": i.stock_minimo,
                "fecha_actualizacion": _dt(i.fecha_actualizacion),
            }
            for i in inventario
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_pedidos_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPORT")
    if error:
        return error

    estado = request.GET.get("estado") or ""
    qs = Pedido.objects.select_related("cod_usuario", "cod_estado_pedido").order_by("-fecha_creacion")
    if estado:
        qs = qs.filter(cod_estado_pedido_id=estado)
    qs = qs[:80]

    estados = EstadoPedido.objects.order_by("orden")
    return _json_ok(
        estados=[{"cod_estado_pedido": e.cod_estado_pedido, "nombre": e.nombre} for e in estados],
        pedidos=[
            {
                "cod_pedido": p.cod_pedido,
                "numero_pedido": p.numero_pedido,
                "cliente": p.cod_usuario.get_full_name() or p.cod_usuario.email,
                "email": p.cod_usuario.email,
                "estado": p.cod_estado_pedido_id,
                "estado_nombre": p.cod_estado_pedido.nombre,
                "total": _money(p.total),
                "fecha": _dt(p.fecha_creacion),
                "requiere_abastecimiento": p.requiere_abastecimiento,
            }
            for p in qs
        ],
    )


@login_required(login_url="/login/")
@require_POST
def api_cambiar_estado_pedido(request, cod_pedido):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error

    estado = request.POST.get("estado") or ""
    comentario = request.POST.get("comentario") or "Cambio desde panel administrativo"
    try:
        if not _es_admin(request.user) and estado not in {"PREPARANDO", "LISTO_ENVIO"}:
            return _json_error("Bodega solo puede marcar pedidos como preparando o listos para envío.", status=403)
        actualizar_estado_pedido(cod_pedido, estado, comentario)
        return _json_ok(mensaje="Estado actualizado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_proveedores_admin(request):
    error = _exigir_roles(request, "SUPPLIER_MANAGER")
    if error:
        return error

    proveedores = Proveedor.objects.order_by("razon_social")[:100]
    return _json_ok(
        proveedores=[
            {
                "cod_proveedor": p.cod_proveedor,
                "ruc": p.ruc,
                "razon_social": p.razon_social,
                "nombre_comercial": p.nombre_comercial,
                "email": p.email,
                "telefono": p.telefono,
                "direccion": p.direccion,
                "ciudad": p.ciudad,
                "provincia": p.provincia,
                "calificacion": _money(p.calificacion),
                "activo": p.activo,
            }
            for p in proveedores
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_reporte_ventas(request):
    error = _exigir_admin(request)
    if error:
        return error

    ventas = ResumenVentaDiaria.objects.order_by("-fecha")[:30]
    return _json_ok(
        ventas=[
            {
                "fecha": v.fecha.isoformat(),
                "total_pedidos": v.total_pedidos,
                "total_clientes": v.total_clientes,
                "total_ventas": _money(v.total_ventas),
                "ticket_promedio": _money(v.ticket_promedio),
            }
            for v in reversed(list(ventas))
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_control_empresarial_admin(request):
    modulo = request.GET.get("modulo") or "usuarios"
    permitidos = {
        "usuarios": (), "auditoria": (), "marketing": (),
        "soporte": ("SUPPORT",), "logistica": ("WAREHOUSE_MANAGER",),
        "inventario": ("WAREHOUSE_MANAGER",),
        "proveedores": ("SUPPLIER_MANAGER",),
    }
    if modulo not in permitidos:
        return _json_error("Módulo empresarial no soportado.", status=400)
    error = _exigir_admin(request) if not permitidos[modulo] else _exigir_roles(request, *permitidos[modulo])
    if error:
        return error
    try:
        if modulo == "usuarios":
            asignaciones = {}
            for ur in UsuarioRol.objects.select_related("cod_rol").order_by("cod_rol__nombre"):
                asignaciones.setdefault(ur.cod_usuario_id, []).append(ur.cod_rol.nombre)
            roles = list(Rol.objects.order_by("nombre"))
            permisos_por_rol = {}
            for rp in RolPermiso.objects.select_related("cod_permiso"):
                permisos_por_rol.setdefault(rp.cod_rol_id, []).append(rp.cod_permiso.codigo)
            return _json_ok(
                usuarios=[{
                    "cod_usuario": u.cod_usuario, "email": u.email, "nombres": u.nombres,
                    "apellidos": u.apellidos, "telefono": u.telefono, "verificado": u.email_verificado,
                    "activo": u.activo, "roles": asignaciones.get(u.cod_usuario, []),
                    "fecha": _dt(u.fecha_creacion),
                } for u in Usuario.objects.order_by("-fecha_creacion")[:300]],
                roles=[{
                    "cod_rol": r.cod_rol, "nombre": r.nombre, "descripcion": r.descripcion,
                    "activo": r.activo, "permisos": permisos_por_rol.get(r.cod_rol, []),
                } for r in roles],
                permisos=[{
                    "cod_permiso": p.cod_permiso, "codigo": p.codigo, "nombre": p.nombre,
                    "descripcion": p.descripcion, "activo": p.activo,
                } for p in Permiso.objects.order_by("codigo")],
            )
        if modulo == "soporte":
            mensajes = {}
            for m in SoporteTicketMensaje.objects.select_related("cod_usuario").order_by("fecha_creacion"):
                mensajes.setdefault(m.cod_ticket_id, []).append({
                    "cod_mensaje": m.cod_ticket_mensaje,
                    "autor": m.cod_usuario.get_full_name() if m.cod_usuario else "Sistema",
                    "mensaje": m.mensaje, "interno": m.interno, "fecha": _dt(m.fecha_creacion),
                })
            return _json_ok(
                tickets=[{
                    "cod_ticket": t.cod_ticket, "cod_usuario": t.cod_usuario_id, "cliente": t.cod_usuario.get_full_name() or t.cod_usuario.email,
                    "email": t.cod_usuario.email, "asunto": t.asunto, "categoria": t.categoria,
                    "prioridad": t.prioridad, "estado": t.estado, "fecha": _dt(t.fecha_creacion),
                    "mensajes": mensajes.get(t.cod_ticket, []),
                } for t in SoporteTicket.objects.select_related("cod_usuario").order_by("-fecha_actualizacion")[:200]],
                notificaciones=[{
                    "cod_notificacion": n.cod_notificacion, "cliente": n.cod_usuario.email if n.cod_usuario else "Global",
                    "tipo": n.tipo, "titulo": n.titulo, "leida": n.leida, "fecha": _dt(n.fecha_creacion),
                } for n in Notificacion.objects.select_related("cod_usuario").order_by("-fecha_creacion")[:100]],
                emails=[{
                    "cod_email": e.cod_email, "destinatario": e.destinatario, "asunto": e.asunto,
                    "estado": e.estado, "intentos": e.intentos, "error": e.error_ultimo,
                    "fecha": _dt(e.fecha_creacion),
                } for e in ColaEmail.objects.order_by("-fecha_creacion")[:100]],
            )
        if modulo == "logistica":
            return _json_ok(
                transportistas=[{
                    "cod_transportista": x.cod_transportista, "nombre": x.nombre,
                    "telefono": x.telefono, "email": x.email, "activo": x.activo,
                } for x in Transportista.objects.order_by("nombre")],
                metodos=[{
                    "cod_metodo_envio": x.cod_metodo_envio, "nombre": x.nombre,
                    "dias_min": x.dias_min, "dias_max": x.dias_max, "costo": _money(x.costo_base),
                    "prime": x.es_premium_gratis, "activo": x.activo,
                } for x in MetodoEnvio.objects.order_by("nombre")],
                zonas=[{
                    "cod_zona": x.cod_zona, "ciudad": x.ciudad, "provincia": x.provincia,
                    "recargo": _money(x.recargo), "activo": x.activo,
                } for x in ZonaEntrega.objects.order_by("provincia", "ciudad")],
            )
        if modulo == "inventario":
            return _json_ok(
                almacenes=[{
                    "cod_almacen": x.cod_almacen, "nombre": x.nombre, "direccion": x.direccion,
                    "ciudad": x.ciudad, "provincia": x.provincia, "activo": x.activo,
                } for x in Almacen.objects.order_by("nombre")],
                movimientos=[{
                    "cod_movimiento": x.cod_movimiento, "producto": x.cod_producto.nombre,
                    "almacen": x.cod_almacen.nombre, "tipo": x.cod_tipo_movimiento_id,
                    "cantidad": x.cantidad, "stock_total": x.stock_total_resultante,
                    "stock_reservado": x.stock_reservado_resultante, "observacion": x.observacion,
                    "fecha": _dt(x.fecha_movimiento),
                } for x in MovimientoInventario.objects.select_related("cod_producto", "cod_almacen").order_by("-fecha_movimiento")[:300]],
                reservas=[{
                    "cod_reserva": x.cod_reserva, "producto": x.cod_producto.nombre,
                    "almacen": x.cod_almacen.nombre, "cliente": x.cod_usuario.email,
                    "pedido": x.cod_pedido_id, "lote": x.cod_lote_id, "cantidad": x.cantidad,
                    "estado": x.estado_reserva or x.estado, "expira": _dt(x.fecha_expiracion or x.expira_en),
                } for x in ReservaInventario.objects.select_related("cod_producto", "cod_almacen", "cod_usuario").order_by("-fecha_creacion")[:300]],
                lotes=[{
                    "cod_lote": x.cod_lote, "numero_lote": x.numero_lote, "producto": x.cod_producto.nombre,
                    "almacen": x.cod_almacen.nombre, "disponible": x.cantidad_disponible,
                    "reservada": x.cantidad_reservada, "estado": x.estado,
                } for x in LoteInventario.objects.select_related("cod_producto", "cod_almacen").order_by("-fecha_creacion")[:200]],
            )
        if modulo == "proveedores":
            stocks = {x.cod_producto_proveedor_id: x.cantidad_disponible for x in ProveedorStock.objects.all()}
            return _json_ok(
                contactos=[{
                    "cod_contacto": x.cod_contacto, "cod_proveedor": x.cod_proveedor_id,
                    "proveedor": x.cod_proveedor.razon_social, "nombre": x.nombre, "cargo": x.cargo,
                    "email": x.email, "telefono": x.telefono, "principal": x.principal,
                } for x in ProveedorContacto.objects.select_related("cod_proveedor").order_by("cod_proveedor__razon_social", "-principal")],
                relaciones=[{
                    "cod_producto_proveedor": x.cod_producto_proveedor, "cod_producto": x.cod_producto_id,
                    "producto": x.cod_producto.nombre, "cod_proveedor": x.cod_proveedor_id,
                    "proveedor": x.cod_proveedor.razon_social, "sku": x.sku_proveedor,
                    "costo": _money(x.costo_unitario), "precio_sugerido": _money(x.precio_sugerido),
                    "plazo": x.tiempo_entrega_dias, "prioridad": x.prioridad,
                    "pedido_minimo": x.pedido_minimo, "pedido_maximo": x.pedido_maximo,
                    "stock": stocks.get(x.cod_producto_proveedor), "activo": x.activo,
                } for x in ProductoProveedor.objects.select_related("cod_producto", "cod_proveedor").order_by("cod_producto__nombre", "prioridad")[:500]],
                historial=[{
                    "cod_historial": x.cod_historial, "proveedor": x.cod_proveedor.razon_social,
                    "evento": x.evento, "descripcion": x.descripcion, "fecha": _dt(x.fecha_evento),
                } for x in HistorialProveedor.objects.select_related("cod_proveedor").order_by("-fecha_evento")[:300]],
            )
        if modulo == "auditoria":
            return _json_ok(
                auditoria=[{
                    "cod_auditoria": x.cod_auditoria, "tabla": x.tabla, "operacion": x.operacion,
                    "registro": x.cod_registro, "usuario_bd": x.usuario_bd, "fecha": _dt(x.fecha_evento),
                } for x in Auditoria.objects.order_by("-fecha_evento")[:300]],
                intentos=[{
                    "cod_intento": x.cod_intento, "email": x.email, "ip": x.ip_origen,
                    "exitoso": x.exitoso, "motivo": x.motivo, "fecha": _dt(x.fecha_intento),
                } for x in IntentoLogin.objects.order_by("-fecha_intento")[:200]],
                busquedas=[{
                    "termino": x.termino, "resultados": x.resultados,
                    "cliente": x.cod_usuario.email if x.cod_usuario else "Anónimo",
                    "fecha": _dt(x.fecha_busqueda),
                } for x in LogBusqueda.objects.select_related("cod_usuario").order_by("-fecha_busqueda")[:200]],
                productos_vistos=[{
                    "producto": x.cod_producto.nombre,
                    "cliente": x.cod_usuario.email if x.cod_usuario else "Anónimo",
                    "fecha": _dt(x.fecha_vista),
                } for x in LogProductoVisto.objects.select_related("cod_usuario", "cod_producto").order_by("-fecha_vista")[:200]],
                carritos_abandonados=[{
                    "cod_carrito": x.cod_carrito_id,
                    "cliente": x.cod_carrito.cod_usuario.email,
                    "total": _money(x.total_estimado), "fecha": _dt(x.fecha_registro),
                } for x in LogCarritoAbandonado.objects.select_related("cod_carrito__cod_usuario").order_by("-fecha_registro")[:200]],
                segmentos=[{
                    "cliente": x.cod_usuario.email, "segmento": x.segmento,
                    "motivo": x.motivo, "fecha": _dt(x.fecha_segmentacion),
                } for x in SegmentoCliente.objects.select_related("cod_usuario").order_by("-fecha_segmentacion")[:200]],
                snapshots=[{
                    "kpi": x.nombre_kpi, "valor": _money(x.valor),
                    "unidad": x.unidad, "fecha": _dt(x.fecha_snapshot),
                } for x in SnapshotKpi.objects.order_by("-fecha_snapshot")[:200]],
            )
        if modulo == "marketing":
            return _json_ok(
                cupones=[{
                    "cod_cupon": x.cod_cupon, "codigo": x.codigo, "nombre": x.nombre,
                    "tipo": x.tipo_descuento, "valor": _money(x.valor), "monto_minimo": _money(x.monto_minimo),
                    "usos_maximos": x.usos_maximos, "usos_por_usuario": x.usos_por_usuario,
                    "inicio": _dt(x.fecha_inicio), "fin": _dt(x.fecha_fin), "activo": x.activo,
                } for x in Cupon.objects.order_by("-fecha_creacion")],
                usos=[{
                    "cod_uso": x.cod_cupon_uso, "cupon": x.cod_cupon.codigo,
                    "cliente": x.cod_usuario.email, "pedido": x.cod_pedido.numero_pedido,
                    "valor": _money(x.valor_aplicado), "fecha": _dt(x.fecha_uso),
                } for x in CuponUso.objects.select_related("cod_cupon", "cod_usuario", "cod_pedido").order_by("-fecha_uso")[:300]],
                asociaciones=[{
                    "promocion": x.cod_promocion.codigo, "producto": x.cod_producto.nombre,
                    "cod_promocion": x.cod_promocion_id, "cod_producto": x.cod_producto_id,
                } for x in PromocionProducto.objects.select_related("cod_promocion", "cod_producto").order_by("cod_promocion__codigo")],
            )
        return _json_error("Módulo empresarial no soportado.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_accion_empresarial_admin(request):
    accion = request.POST.get("accion") or ""
    acciones_soporte = {"responder_ticket", "estado_ticket", "notificar_cliente"}
    acciones_bodega = {
        "crear_almacen", "actualizar_almacen", "crear_transportista", "actualizar_transportista",
        "crear_metodo_envio", "actualizar_metodo_envio", "crear_zona", "actualizar_zona",
    }
    if accion in acciones_soporte:
        error = _exigir_roles(request, "SUPPORT")
    elif accion in acciones_bodega:
        error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    else:
        error = _exigir_admin(request)
    if error:
        return error
    try:
        if accion == "crear_usuario":
            ident = usuario_service.crear_usuario_cliente(
                request.POST["email"], request.POST["password"], request.POST["nombres"],
                request.POST["apellidos"], request.POST.get("telefono") or None,
                request.POST.get("documento_identidad") or None,
            )
            rol = request.POST.get("rol") or "CUSTOMER"
            if rol != "CUSTOMER":
                usuario_service.asignar_rol_usuario(ident, rol)
            return _json_ok(cod_usuario=ident, mensaje="Usuario creado con trazabilidad.")
        if accion == "actualizar_usuario":
            ident = _post_int(request, "cod_usuario")
            actual = Usuario.objects.get(pk=ident)
            usuario_service.actualizar_usuario(
                ident, request.POST.get("nombres") or actual.nombres,
                request.POST.get("apellidos") or actual.apellidos,
                request.POST.get("telefono") if "telefono" in request.POST else actual.telefono,
                _post_bool(request, "email_verificado", actual.email_verificado),
                _post_bool(request, "activo", actual.activo),
            )
            if request.POST.get("password"):
                usuario_service.cambiar_password_usuario(ident, request.POST["password"])
            return _json_ok(mensaje="Usuario actualizado.")
        if accion in {"desactivar_usuario", "reactivar_usuario"}:
            ident = _post_int(request, "cod_usuario")
            if ident == request.user.pk and accion == "desactivar_usuario":
                raise ValueError("No puedes desactivar tu propia sesión administrativa.")
            (usuario_service.desactivar_usuario if accion == "desactivar_usuario" else control_service.reactivar_usuario)(ident)
            return _json_ok(mensaje="Estado del usuario actualizado.")
        if accion in {"asignar_rol", "quitar_rol"}:
            servicio = usuario_service.asignar_rol_usuario if accion == "asignar_rol" else usuario_service.quitar_rol_usuario
            servicio(_post_int(request, "cod_usuario"), request.POST["rol"])
            return _json_ok(mensaje="Roles del usuario actualizados.")
        if accion == "crear_rol":
            return _json_ok(cod_rol=control_service.crear_rol(request.POST["nombre"], request.POST.get("descripcion") or None), mensaje="Rol creado.")
        if accion == "actualizar_rol":
            control_service.actualizar_rol(_post_int(request, "cod_rol"), request.POST["nombre"], request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
            return _json_ok(mensaje="Rol actualizado.")
        if accion == "crear_permiso":
            return _json_ok(cod_permiso=control_service.crear_permiso(request.POST["codigo"], request.POST["nombre"], request.POST.get("descripcion") or None), mensaje="Permiso creado.")
        if accion == "actualizar_permiso":
            control_service.actualizar_permiso(_post_int(request, "cod_permiso"), request.POST["codigo"], request.POST["nombre"], request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
            return _json_ok(mensaje="Permiso actualizado.")
        if accion in {"asignar_permiso", "revocar_permiso"}:
            servicio = control_service.asignar_permiso_rol if accion == "asignar_permiso" else control_service.revocar_permiso_rol
            servicio(_post_int(request, "cod_rol"), _post_int(request, "cod_permiso"))
            return _json_ok(mensaje="Permisos del rol actualizados.")
        if accion == "responder_ticket":
            responder_ticket_soporte(_post_int(request, "cod_ticket"), request.user.pk, request.POST["mensaje"], _post_bool(request, "interno"), request.POST.get("estado") or "EN_PROCESO")
            return _json_ok(mensaje="Respuesta registrada.")
        if accion == "estado_ticket":
            control_service.actualizar_estado_ticket(_post_int(request, "cod_ticket"), request.POST["estado"])
            return _json_ok(mensaje="Estado del ticket actualizado.")
        if accion == "notificar_cliente":
            crear_notificacion(_post_int(request, "cod_usuario"), request.POST.get("tipo") or "SOPORTE", request.POST["titulo"], request.POST["mensaje"], request.POST.get("url") or None)
            return _json_ok(mensaje="Notificación creada.")
        if accion == "crear_almacen":
            return _json_ok(cod_almacen=crear_almacen(request.POST["nombre"], request.POST["direccion"], request.POST["ciudad"], request.POST["provincia"]), mensaje="Almacén creado.")
        if accion == "actualizar_almacen":
            control_service.actualizar_almacen(_post_int(request, "cod_almacen"), request.POST["nombre"], request.POST["direccion"], request.POST["ciudad"], request.POST["provincia"], _post_bool(request, "activo"))
            return _json_ok(mensaje="Almacen actualizado.")
        if accion == "crear_transportista":
            return _json_ok(cod_transportista=control_service.crear_transportista(request.POST["nombre"], request.POST.get("telefono") or None, request.POST.get("email") or None), mensaje="Transportista creado.")
        if accion == "actualizar_transportista":
            control_service.actualizar_transportista(_post_int(request, "cod_transportista"), request.POST["nombre"], request.POST.get("telefono") or None, request.POST.get("email") or None, _post_bool(request, "activo", True))
            return _json_ok(mensaje="Transportista actualizado.")
        if accion == "crear_metodo_envio":
            return _json_ok(cod_metodo_envio=control_service.crear_metodo_envio(request.POST["nombre"], _post_int(request, "dias_min"), _post_int(request, "dias_max"), _post_decimal(request, "costo"), _post_bool(request, "prime")), mensaje="Método de envío creado.")
        if accion == "actualizar_metodo_envio":
            control_service.actualizar_metodo_envio(_post_int(request, "cod_metodo_envio"), request.POST["nombre"], _post_int(request, "dias_min"), _post_int(request, "dias_max"), _post_decimal(request, "costo"), _post_bool(request, "prime"), _post_bool(request, "activo"))
            return _json_ok(mensaje="Metodo de envio actualizado.")
        if accion == "crear_zona":
            return _json_ok(cod_zona=control_service.crear_zona(request.POST["ciudad"], request.POST["provincia"], _post_decimal(request, "recargo", False) or 0), mensaje="Zona de entrega creada.")
        if accion == "actualizar_zona":
            control_service.actualizar_zona(_post_int(request, "cod_zona"), request.POST["ciudad"], request.POST["provincia"], _post_decimal(request, "recargo", False) or 0, _post_bool(request, "activo"))
            return _json_ok(mensaje="Zona de entrega actualizada.")
        if accion == "crear_plan_prime":
            return _json_ok(cod_plan=crear_plan_membresia(request.POST["nombre"], _post_decimal(request, "precio"), _post_int(request, "duracion")), mensaje="Plan Prime creado.")
        if accion == "actualizar_plan_prime":
            control_service.actualizar_plan(_post_int(request, "cod_plan"), request.POST["nombre"], _post_decimal(request, "precio"), _post_int(request, "duracion"), _post_bool(request, "activo", True))
            return _json_ok(mensaje="Plan Prime actualizado.")
        if accion == "desactivar_plan_prime":
            desactivar_plan_membresia(_post_int(request, "cod_plan"))
            return _json_ok(mensaje="Plan Prime desactivado.")
        if accion == "cancelar_membresia":
            control_service.cancelar_membresia(_post_int(request, "cod_membresia"))
            return _json_ok(mensaje="Membresía cancelada conservando su historial.")
        if accion == "aprobar_devolucion":
            aprobar_devolucion(_post_int(request, "cod_devolucion"), request.POST.get("comentario") or "Aprobada por administración")
            return _json_ok(mensaje="Devolución aprobada.")
        if accion == "reembolsar_devolucion":
            ident = generar_reembolso_simulado(_post_int(request, "cod_devolucion"))
            return _json_ok(cod_reembolso=ident, mensaje="Reembolso simulado generado.")
        return _json_error("Acción empresarial no soportada.", status=400)
    except (KeyError, ValueError, Usuario.DoesNotExist) as exc:
        return _json_error(str(exc) or "Datos inválidos.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


# APIs ampliadas de Fase H. Las vistas validan HTTP/permisos; los cambios se
# delegan a services, que invocan las funciones SQL del esquema public.
@login_required(login_url="/login/")
@require_GET
def api_catalogo_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    entidad = request.GET.get("entidad", "producto")
    try:
        return _json_ok(entidad=entidad, registros=panel_service.listar_entidad(entidad, request.GET.get("activos", "1") != "0"))
    except Exception as exc:
        return _json_error(_safe_error(exc), status=400)


@login_required(login_url="/login/")
@require_POST
def api_categoria_admin(request, cod_categoria=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_categoria is None:
            ident = crear_categoria(request.POST["nombre"], request.POST["slug"], request.POST.get("descripcion") or None, _post_int(request, "cod_categoria_padre", False))
            return _json_ok(cod_categoria=ident, mensaje="Categoría creada.")
        if _post_bool(request, "desactivar"):
            eliminar_categoria_logica(cod_categoria)
        else:
            actualizar_categoria(cod_categoria, request.POST.get("nombre") or None, request.POST.get("slug") or None, request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Categoría actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_marca_admin(request, cod_marca=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_marca is None:
            return _json_ok(cod_marca=crear_marca(request.POST["nombre"], request.POST.get("descripcion") or None), mensaje="Marca creada.")
        if _post_bool(request, "desactivar"):
            eliminar_marca_logica(cod_marca)
        else:
            actualizar_marca(cod_marca, request.POST.get("nombre") or None, request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Marca actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_producto_admin(request, cod_producto=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_producto is None:
            ident = crear_producto(_post_int(request, "cod_categoria"), _post_int(request, "cod_marca"), request.POST["sku"], request.POST["nombre"], request.POST.get("descripcion", ""), _post_decimal(request, "precio_actual"), _post_decimal(request, "peso_kg", False) or 0, _post_decimal(request, "largo_cm", False) or 0, _post_decimal(request, "ancho_cm", False) or 0, _post_decimal(request, "alto_cm", False) or 0)
            return _json_ok(cod_producto=ident, mensaje="Producto creado.")
        actual = Producto.objects.get(pk=cod_producto)
        control_service.actualizar_producto_completo(
            cod_producto, _post_int(request, "cod_categoria", False) or actual.cod_categoria_id,
            _post_int(request, "cod_marca", False) or actual.cod_marca_id,
            request.POST.get("sku") or actual.sku, request.POST.get("nombre") or actual.nombre,
            request.POST.get("descripcion") if "descripcion" in request.POST else actual.descripcion,
            _post_decimal(request, "precio_actual", False) or actual.precio_actual,
            _post_decimal(request, "peso_kg", False) if request.POST.get("peso_kg") not in (None, "") else actual.peso_kg,
            _post_decimal(request, "largo_cm", False) if request.POST.get("largo_cm") not in (None, "") else actual.largo_cm,
            _post_decimal(request, "ancho_cm", False) if request.POST.get("ancho_cm") not in (None, "") else actual.ancho_cm,
            _post_decimal(request, "alto_cm", False) if request.POST.get("alto_cm") not in (None, "") else actual.alto_cm,
        )
        return _json_ok(mensaje="Producto actualizado.")
    except (KeyError, ValueError, Producto.DoesNotExist) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_producto_integral_admin(request):
    """Crea datos, multimedia, PDF, límite y proveedores en una sola operación."""
    error = _exigir_admin(request)
    if error:
        return error
    archivos_guardados = []
    try:
        imagenes = request.FILES.getlist("imagenes")
        imagenes_url = [x.strip() for x in (request.POST.get("imagenes_url") or "").splitlines() if x.strip()]
        ficha_archivo = request.FILES.get("ficha_tecnica")
        ficha_url = (request.POST.get("ficha_url") or "").strip()
        video_archivo = request.FILES.get("video")
        video_url = (request.POST.get("video_url") or "").strip()
        if not imagenes and not imagenes_url:
            raise ValueError("Agrega al menos una imagen del producto.")
        if not ficha_archivo and not ficha_url:
            raise ValueError("La ficha técnica PDF es obligatoria.")
        if ficha_url and not ficha_url.lower().split("?", 1)[0].endswith(".pdf"):
            raise ValueError("La URL de ficha técnica debe apuntar a un archivo PDF.")
        proveedores = json.loads(request.POST.get("proveedores") or "[]")
        if not isinstance(proveedores, list):
            raise ValueError("La configuración de proveedores no es válida.")
        ids_proveedor = [int(x["cod_proveedor"]) for x in proveedores if x.get("cod_proveedor")]
        if len(ids_proveedor) != len(set(ids_proveedor)):
            raise ValueError("No repitas un proveedor en el producto.")

        with transaction.atomic():
            ident = crear_producto(
                _post_int(request, "cod_categoria"), _post_int(request, "cod_marca"),
                request.POST["sku"], request.POST["nombre"], request.POST.get("descripcion", ""),
                _post_decimal(request, "precio_actual"), _post_decimal(request, "peso_kg", False) or 0,
                _post_decimal(request, "largo_cm", False) or 0, _post_decimal(request, "ancho_cm", False) or 0,
                _post_decimal(request, "alto_cm", False) or 0,
            )
            urls_imagen = []
            for archivo in imagenes:
                url = _guardar_archivo_producto(archivo, ident, "IMAGEN")
                archivos_guardados.append(url)
                urls_imagen.append(url)
            urls_imagen.extend(_validar_url_imagen(url) for url in imagenes_url)
            for orden, url in enumerate(urls_imagen, 1):
                agregar_imagen_producto(ident, url, request.POST.get("nombre") or "Producto TechTail", orden == 1, orden)

            if ficha_archivo:
                ficha_url = _guardar_archivo_producto(ficha_archivo, ident, "FICHA")
                archivos_guardados.append(ficha_url)
            else:
                ficha_url = _validar_url_imagen(ficha_url)
            control_service.configurar_archivo_producto(ident, "FICHA", ficha_url, request.POST.get("ficha_titulo") or "Ficha técnica PDF")

            if video_archivo:
                video_url = _guardar_archivo_producto(video_archivo, ident, "VIDEO")
                archivos_guardados.append(video_url)
            elif video_url:
                video_url = _validar_url_imagen(video_url)
            if video_url:
                control_service.configurar_archivo_producto(ident, "VIDEO", video_url, request.POST.get("video_titulo") or "Video del producto")

            control_service.configurar_limite_producto(
                ident, _post_int(request, "limite_por_pedido"),
                _post_int(request, "limite_por_dia", False), _post_int(request, "limite_por_mes", False),
                _post_bool(request, "requiere_revision"), True,
            )
            for prioridad, fila in enumerate(proveedores, 1):
                if not fila.get("cod_proveedor"):
                    continue
                asociar_producto_proveedor(
                    ident, int(fila["cod_proveedor"]), fila.get("sku_proveedor") or request.POST["sku"],
                    Decimal(str(fila.get("costo_unitario") or "0")),
                    Decimal(str(fila["precio_sugerido"])) if fila.get("precio_sugerido") not in (None, "") else None,
                    int(fila.get("tiempo_entrega_dias") or 3), int(fila.get("prioridad") or prioridad),
                    int(fila.get("pedido_minimo") or 1),
                    int(fila["pedido_maximo"]) if fila.get("pedido_maximo") not in (None, "") else None,
                    int(fila.get("cantidad_disponible") or 0),
                )

        producto = Producto.objects.get(pk=ident)
        diagnostico = _diagnostico_publicacion(producto)
        publicado = False
        if _post_bool(request, "publicar") and diagnostico["publicable"]:
            publicar_producto(ident)
            publicado = True
        mensaje = "Producto creado y publicado." if publicado else "Producto creado como borrador."
        if _post_bool(request, "publicar") and not publicado:
            mensaje += " Completa los requisitos indicados para publicarlo."
        return _json_ok(
            cod_producto=ident, publicado=publicado, mensaje=mensaje,
            publicacion=diagnostico,
        )
    except (KeyError, ValueError, json.JSONDecodeError) as exc:
        for url in archivos_guardados:
            _eliminar_archivo_producto_local(url)
        return _json_error(str(exc), status=400)
    except Exception as exc:
        for url in archivos_guardados:
            _eliminar_archivo_producto_local(url)
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_validar_producto_publicable(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        validar_producto_publicable(cod_producto)
        return _json_ok(publicable=True, mensaje="El producto cumple las reglas de publicación.")
    except Exception as exc:
        return _json_ok(publicable=False, mensaje=_safe_error(exc))


@login_required(login_url="/login/")
@require_POST
def api_imagen_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        archivo = request.FILES.get("archivo")
        url = _guardar_archivo_producto(archivo, cod_producto, "IMAGEN") if archivo else _validar_url_imagen(request.POST.get("url_imagen"))
        ident = agregar_imagen_producto(cod_producto, url, request.POST.get("alt_text") or None, _post_bool(request, "es_principal"), _post_int(request, "orden", False) or 1)
        return _json_ok(cod_imagen=ident, mensaje="Imagen registrada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_imagen_admin(request, cod_imagen):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        accion = request.POST.get("accion")
        if accion == "desactivar":
            desactivar_imagen_producto(cod_imagen)
        elif accion == "ordenar":
            ordenar_imagen_producto(cod_imagen, _post_int(request, "orden"), _post_bool(request, "es_principal"))
        elif accion == "actualizar":
            actualizar_imagen_producto(cod_imagen, _validar_url_imagen(request.POST["url_imagen"]), request.POST.get("alt_text") or None, _post_int(request, "orden"), _post_bool(request, "activo", True))
        else:
            return _json_error("Acción de imagen no soportada.")
        return _json_ok(mensaje="Imagen actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_gestion_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        p = Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto").get(pk=cod_producto)
        metadata = p.metadata if isinstance(p.metadata, dict) else {}
        respuestas = {
            r.cod_pregunta_id: r
            for r in ProductoRespuesta.objects.filter(cod_pregunta__cod_producto_id=cod_producto).select_related("cod_usuario")
        }
        proveedores = []
        for relacion in ProductoProveedor.objects.filter(cod_producto_id=cod_producto).select_related("cod_proveedor").order_by("prioridad"):
            try:
                stock = relacion.proveedorstock.cantidad_disponible
            except Exception:
                stock = None
            proveedores.append({
                "cod_producto_proveedor": relacion.cod_producto_proveedor,
                "cod_proveedor": relacion.cod_proveedor_id,
                "proveedor": relacion.cod_proveedor.razon_social,
                "costo": _money(relacion.costo_unitario),
                "plazo_dias": relacion.tiempo_entrega_dias,
                "prioridad": relacion.prioridad,
                "stock": stock,
                "activo": relacion.activo,
            })
        return _json_ok(
            producto={
                "cod_producto": p.cod_producto, "sku": p.sku, "nombre": p.nombre,
                "descripcion": p.descripcion, "precio": _money(p.precio_actual),
                "cod_categoria": p.cod_categoria_id, "categoria": p.cod_categoria.nombre,
                "cod_marca": p.cod_marca_id, "marca": p.cod_marca.nombre,
                "estado": p.cod_estado_producto_id, "peso_kg": _money(p.peso_kg),
                "largo_cm": _money(p.largo_cm), "ancho_cm": _money(p.ancho_cm),
                "alto_cm": _money(p.alto_cm), "metadata": metadata,
            },
            publicacion=_diagnostico_publicacion(p),
            categorias=[{"cod_categoria": x.cod_categoria, "nombre": x.nombre} for x in Categoria.objects.filter(activo=True).order_by("nombre")],
            marcas=[{"cod_marca": x.cod_marca, "nombre": x.nombre} for x in Marca.objects.filter(activo=True).order_by("nombre")],
            productos=[{"cod_producto": x.cod_producto, "nombre": x.nombre, "sku": x.sku} for x in Producto.objects.exclude(pk=cod_producto).order_by("nombre")[:500]],
            imagenes=[{
                "cod_imagen": x.cod_imagen, "url": x.url_imagen, "alt_text": x.alt_text,
                "principal": x.es_principal, "orden": x.orden, "activo": x.activo,
            } for x in ProductoImagen.objects.filter(cod_producto_id=cod_producto).order_by("orden", "cod_imagen")],
            archivos={"videos": metadata.get("videos", []), "ficha_tecnica": metadata.get("ficha_tecnica")},
            atributos=[{"cod_atributo": x.cod_atributo, "nombre": x.nombre, "tipo_dato": x.tipo_dato} for x in ProductoAtributo.objects.filter(activo=True).order_by("nombre")],
            valores=[{
                "cod_atributo": x.cod_atributo_id, "atributo": x.cod_atributo.nombre,
                "valor": x.valor, "activo": x.activo,
            } for x in ProductoAtributoValor.objects.filter(cod_producto_id=cod_producto).select_related("cod_atributo").order_by("cod_atributo__nombre")],
            relacionados=[{
                "cod_producto": x.cod_producto_relacionado_id,
                "nombre": x.cod_producto_relacionado.nombre,
                "sku": x.cod_producto_relacionado.sku,
                "tipo": x.tipo_relacion,
            } for x in ProductoRelacionado.objects.filter(cod_producto_id=cod_producto).select_related("cod_producto_relacionado")],
            limite=next(({
                "cod_regla": x.cod_regla, "por_pedido": x.limite_por_pedido,
                "por_dia": x.limite_por_dia, "por_mes": x.limite_por_mes,
                "requiere_revision": x.requiere_revision, "activo": x.activo,
            } for x in ReglaLimiteCompra.objects.filter(cod_producto_id=cod_producto).order_by("-activo", "-fecha_creacion")), None),
            proveedores=proveedores,
            promociones=[{
                "cod_promocion": x.cod_promocion_id, "codigo": x.cod_promocion.codigo,
                "nombre": x.cod_promocion.nombre, "activo": x.cod_promocion.activo,
            } for x in PromocionProducto.objects.filter(cod_producto_id=cod_producto).select_related("cod_promocion")],
            promociones_disponibles=[{
                "cod_promocion": x.cod_promocion, "codigo": x.codigo, "nombre": x.nombre,
            } for x in Promocion.objects.filter(activo=True).order_by("nombre")],
            resenas=[{
                "cod_resena": x.cod_resena, "cliente": x.cod_usuario.get_full_name() or x.cod_usuario.email,
                "calificacion": x.calificacion, "titulo": x.titulo, "comentario": x.comentario,
                "aprobado": x.aprobado, "fecha": _dt(x.fecha_creacion),
            } for x in ProductoResena.objects.filter(cod_producto_id=cod_producto).select_related("cod_usuario").order_by("-fecha_creacion")],
            preguntas=[{
                "cod_pregunta": x.cod_pregunta, "cliente": x.cod_usuario.get_full_name() or x.cod_usuario.email,
                "pregunta": x.pregunta, "estado": x.estado, "fecha": _dt(x.fecha_creacion),
                "respuesta": respuestas[x.cod_pregunta].respuesta if x.cod_pregunta in respuestas else None,
            } for x in ProductoPregunta.objects.filter(cod_producto_id=cod_producto).select_related("cod_usuario").order_by("-fecha_creacion")],
        )
    except Producto.DoesNotExist:
        return _json_error("Producto no encontrado.", status=404)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_archivo_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        tipo = (request.POST.get("tipo") or "").upper()
        if tipo not in {"VIDEO", "FICHA"}:
            raise ValueError("Tipo de archivo no soportado.")
        eliminar = _post_bool(request, "eliminar")
        archivo = request.FILES.get("archivo")
        url = request.POST.get("url") or ""
        if archivo and not eliminar:
            url = _guardar_archivo_producto(archivo, cod_producto, tipo)
        if not eliminar:
            if not url:
                raise ValueError("Adjunta un archivo o indica una URL.")
            parsed = urlparse(url)
            if not url.startswith(settings.MEDIA_URL) and parsed.scheme not in ("http", "https"):
                raise ValueError("La URL del archivo no es válida.")
        control_service.configurar_archivo_producto(cod_producto, tipo, url, request.POST.get("titulo") or None, eliminar)
        return _json_ok(url=url, mensaje="Archivo del producto actualizado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_limite_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        ident = control_service.configurar_limite_producto(
            cod_producto, _post_int(request, "limite_por_pedido"),
            _post_int(request, "limite_por_dia", False), _post_int(request, "limite_por_mes", False),
            _post_bool(request, "requiere_revision"), _post_bool(request, "activo", True),
        )
        return _json_ok(cod_regla=ident, mensaje="Límite retail actualizado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_relacion_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        relacionado = _post_int(request, "cod_producto_relacionado")
        if _post_bool(request, "desasociar"):
            control_service.desasociar_producto_relacionado(cod_producto, relacionado)
        else:
            control_service.asociar_producto_relacionado(cod_producto, relacionado, request.POST.get("tipo") or "RELACIONADO")
        return _json_ok(mensaje="Productos relacionados actualizados.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_moderacion_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        entidad = request.POST.get("entidad")
        if entidad == "resena":
            resena = ProductoResena.objects.get(pk=_post_int(request, "cod_resena"), cod_producto_id=cod_producto)
            control_service.moderar_resena(resena.cod_resena, _post_bool(request, "aprobado"))
        elif entidad == "pregunta":
            pregunta = ProductoPregunta.objects.get(pk=_post_int(request, "cod_pregunta"), cod_producto_id=cod_producto)
            respuesta = (request.POST.get("respuesta") or "").strip()
            if respuesta:
                control_service.responder_pregunta(pregunta.cod_pregunta, request.user.pk, respuesta)
            else:
                control_service.moderar_pregunta(pregunta.cod_pregunta, request.POST.get("estado") or "PUBLICADA")
        else:
            raise ValueError("Entidad de moderación no soportada.")
        return _json_ok(mensaje="Moderación actualizada.")
    except (ValueError, ProductoResena.DoesNotExist, ProductoPregunta.DoesNotExist) as exc:
        return _json_error(str(exc) or "Registro no encontrado.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_atributo_producto_admin(request, cod_atributo=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_atributo is None:
            ident = crear_producto_atributo(request.POST["nombre"], request.POST.get("tipo_dato") or "TEXT")
            return _json_ok(cod_atributo=ident, mensaje="Atributo técnico creado.")
        if _post_bool(request, "desactivar"):
            desactivar_producto_atributo(cod_atributo)
        else:
            actualizar_producto_atributo(cod_atributo, request.POST["nombre"], request.POST.get("tipo_dato") or "TEXT", _post_bool(request, "activo", True))
        return _json_ok(mensaje="Atributo técnico actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_valor_atributo_producto_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        producto, atributo = _post_int(request, "cod_producto"), _post_int(request, "cod_atributo")
        if _post_bool(request, "desasociar"):
            desasociar_producto_atributo_valor(producto, atributo)
        else:
            valor = (request.POST.get("valor") or "").strip()
            if not valor:
                return _json_error("El valor técnico es obligatorio.")
            asignar_producto_atributo_valor(producto, atributo, valor)
        return _json_ok(mensaje="Valor técnico actualizado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_beneficio_prime_admin(request, cod_beneficio=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_beneficio is None:
            ident = crear_beneficio_membresia(_post_int(request, "cod_plan"), request.POST["codigo"], request.POST["nombre"], _post_decimal(request, "valor", False), request.POST.get("descripcion") or None)
            return _json_ok(cod_beneficio=ident, mensaje="Beneficio Prime creado.")
        if _post_bool(request, "desactivar"):
            desactivar_beneficio_membresia(cod_beneficio)
        else:
            actualizar_beneficio_membresia(cod_beneficio, request.POST["nombre"], _post_decimal(request, "valor", False), request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Beneficio Prime actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_regla_precio_admin(request, cod_regla_precio=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_regla_precio is None:
            ident = crear_regla_precio(_post_int(request, "cod_producto", False), _post_int(request, "cod_categoria", False), _post_decimal(request, "margen_porcentaje"), _post_decimal(request, "costo_operativo_porcentaje", False) or 0, _post_decimal(request, "costo_fijo_unitario", False) or 0, _post_decimal(request, "porcentaje_impuesto", False), _post_int(request, "prioridad", False) or 100)
            return _json_ok(cod_regla_precio=ident, mensaje="Regla de precio creada.")
        if _post_bool(request, "desactivar"):
            desactivar_regla_precio(cod_regla_precio)
        else:
            actualizar_regla_precio(cod_regla_precio, _post_decimal(request, "margen_porcentaje"), _post_decimal(request, "costo_operativo_porcentaje", False) or 0, _post_decimal(request, "costo_fijo_unitario", False) or 0, _post_decimal(request, "porcentaje_impuesto", False), _post_int(request, "prioridad", False) or 100, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Regla de precio actualizada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_recalcular_precio_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        recalcular_precio_desde_producto(cod_producto)
        return _json_ok(mensaje="Precio de exhibición recalculado desde el lote FIFO.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_lotes_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error
    return _json_ok(lotes=[{"cod_lote": l.cod_lote, "numero_lote": l.numero_lote, "producto": l.cod_producto.nombre, "almacen": l.cod_almacen.nombre, "proveedor": l.cod_proveedor.razon_social if l.cod_proveedor else None, "disponible": l.cantidad_disponible, "reservada": l.cantidad_reservada, "costo": _money(l.costo_unitario), "pvp": _money(l.pvp_unitario), "estado": l.estado, "fecha_recepcion": _dt(l.fecha_recepcion)} for l in panel_service.listar_lotes()])


@login_required(login_url="/login/")
@require_POST
def api_lote_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error
    try:
        ident = crear_lote_inventario(_post_int(request, "cod_producto"), _post_int(request, "cod_almacen"), _post_int(request, "cantidad_recibida"), _post_decimal(request, "costo_unitario"), request.POST.get("numero_lote") or None, _post_int(request, "cod_proveedor", False), _post_int(request, "cod_orden_abastecimiento_detalle", False))
        return _json_ok(cod_lote=ident, mensaje="Lote creado y stock sincronizado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_alertas_stock_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error
    return _json_ok(alertas=[{"cod_alerta": a.cod_alerta, "producto": a.cod_producto.nombre, "almacen": a.cod_almacen.nombre, "tipo": a.tipo_alerta, "mensaje": a.mensaje, "atendida": a.atendida, "fecha": _dt(a.fecha_creacion)} for a in panel_service.listar_alertas_stock()])


@login_required(login_url="/login/")
@require_POST
def api_accion_inventario_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error
    try:
        accion = request.POST.get("accion")
        if accion == "recalcular":
            recalcular_inventario_desde_lotes(_post_int(request, "cod_producto", False), _post_int(request, "cod_almacen", False))
        elif accion == "ajustar":
            ajustar_inventario(_post_int(request, "cod_producto"), _post_int(request, "cod_almacen"), _post_int(request, "stock_total"), request.POST.get("observacion") or "Ajuste manual controlado desde panel")
        elif accion == "movimiento":
            registrar_movimiento_inventario(_post_int(request, "cod_producto"), _post_int(request, "cod_almacen"), request.POST["tipo"], _post_int(request, "cantidad"), "PANEL", request.user.pk, request.POST.get("observacion") or None)
        elif accion == "expirar_reservas":
            total = expirar_reservas_vencidas()
            return _json_ok(expiradas=total, mensaje="Reservas vencidas procesadas.")
        elif accion == "liberar_reservas_pedido":
            liberar_reservas_pedido(_post_int(request, "cod_pedido"))
        elif accion == "estado_lote":
            control_service.actualizar_estado_lote(_post_int(request, "cod_lote"), request.POST["estado"])
        elif accion == "reponer":
            generar_reposicion_automatica(_post_int(request, "cod_producto"), _post_int(request, "cod_almacen"))
        elif accion == "resolver_alerta":
            resolver_alerta_stock(_post_int(request, "cod_alerta"), request.POST.get("observacion") or None)
        else:
            return _json_error("Acción de inventario no soportada.", status=400)
        return _json_ok(mensaje="Operación de inventario completada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_proveedor_admin(request, cod_proveedor=None):
    error = _exigir_roles(request, "SUPPLIER_MANAGER")
    if error:
        return error
    try:
        if cod_proveedor is None:
            ident = crear_proveedor(request.POST["ruc"], request.POST["razon_social"], request.POST.get("nombre_comercial") or None, request.POST["email"], request.POST.get("telefono") or None, request.POST.get("direccion") or None, request.POST.get("ciudad") or None, request.POST.get("provincia") or None)
            return _json_ok(cod_proveedor=ident, mensaje="Proveedor creado.")
        if _post_bool(request, "desactivar"):
            eliminar_proveedor_logico(cod_proveedor)
        else:
            actualizar_proveedor(cod_proveedor, request.POST.get("razon_social") or None, request.POST.get("nombre_comercial") or None, request.POST.get("email") or None, request.POST.get("telefono") or None, request.POST.get("direccion") or None, request.POST.get("ciudad") or None, request.POST.get("provincia") or None, _post_decimal(request, "calificacion", False), _post_bool(request, "activo", True))
        return _json_ok(mensaje="Proveedor actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_usuario_proveedor_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        usuario, proveedor = _post_int(request, "cod_usuario"), _post_int(request, "cod_proveedor")
        if _post_bool(request, "desasociar"):
            desasociar_usuario_proveedor(usuario, proveedor)
            return _json_ok(mensaje="Acceso de proveedor desactivado.")
        ident = asociar_usuario_proveedor(usuario, proveedor)
        return _json_ok(cod_usuario_proveedor=ident, mensaje="Acceso de proveedor asociado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_abastecimiento_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPLIER_MANAGER")
    if error:
        return error
    return _json_ok(ordenes=[{"cod_orden_abastecimiento": o.cod_orden_abastecimiento, "proveedor": o.cod_proveedor.razon_social, "almacen": o.cod_almacen.nombre if o.cod_almacen else None, "estado": o.estado, "total_estimado": _money(o.total_estimado), "fecha": _dt(o.fecha_creacion)} for o in panel_service.listar_ordenes_abastecimiento()])


@login_required(login_url="/login/")
@require_POST
def api_accion_abastecimiento_admin(request, cod_orden_abastecimiento):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPLIER_MANAGER")
    if error:
        return error
    try:
        accion = request.POST.get("accion")
        roles = _roles_usuario(request.user)
        if not _es_admin(request.user) and "WAREHOUSE_MANAGER" in roles and accion != "recibir":
            return _json_error("Bodega solo puede registrar recepciones.", status=403)
        if not _es_admin(request.user) and "SUPPLIER_MANAGER" in roles and accion == "recibir":
            return _json_error("La recepción física corresponde a bodega.", status=403)
        if accion == "recibir":
            recibir_orden_abastecimiento(cod_orden_abastecimiento, _post_int(request, "cod_almacen"), request.POST.get("observacion") or "Recepción desde panel administrativo")
        elif accion == "cancelar":
            cancelar_orden_abastecimiento(cod_orden_abastecimiento, request.POST.get("motivo") or "Cancelada por administración")
        else:
            return _json_error("Acción de abastecimiento no soportada.", status=400)
        return _json_ok(mensaje="Orden de abastecimiento actualizada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_contacto_proveedor_admin(request, cod_proveedor):
    error = _exigir_roles(request, "SUPPLIER_MANAGER")
    if error:
        return error
    try:
        ident = crear_contacto_proveedor(cod_proveedor, request.POST["nombre"], request.POST.get("cargo") or None, request.POST.get("email") or None, request.POST.get("telefono") or None, _post_bool(request, "principal"))
        return _json_ok(cod_contacto=ident, mensaje="Contacto registrado.")
    except KeyError as exc:
        return _json_error(f"Falta el campo {exc.args[0]}.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_producto_proveedor_admin(request):
    error = _exigir_roles(request, "SUPPLIER_MANAGER")
    if error:
        return error
    try:
        if request.POST.get("accion") == "stock":
            actualizar_stock_proveedor(_post_int(request, "cod_producto_proveedor"), _post_int(request, "cantidad_disponible"))
            return _json_ok(mensaje="Stock del proveedor actualizado.")
        producto = _post_int(request, "cod_producto")
        proveedor = _post_int(request, "cod_proveedor")
        if _post_bool(request, "desasociar"):
            desasociar_producto_proveedor(producto, proveedor)
            return _json_ok(mensaje="Relación con proveedor desactivada.")
        ident = asociar_producto_proveedor(producto, proveedor, request.POST["sku_proveedor"], _post_decimal(request, "costo_unitario"), _post_decimal(request, "precio_sugerido", False), _post_int(request, "tiempo_entrega_dias", False) or 3, _post_int(request, "prioridad", False) or 100, _post_int(request, "pedido_minimo", False) or 1, _post_int(request, "pedido_maximo", False), _post_int(request, "cantidad_disponible", False) or 0)
        return _json_ok(cod_producto_proveedor=ident, mensaje="Producto asociado al proveedor.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_cupon_admin(request, cod_cupon=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_cupon is None:
            ident = crear_cupon(request.POST["codigo"], request.POST["nombre"], request.POST["tipo_descuento"], _post_decimal(request, "valor"), _post_decimal(request, "monto_minimo", False) or 0, _post_int(request, "usos_maximos", False), _post_int(request, "usos_por_usuario", False) or 1, _post_int(request, "dias_vigencia", False) or 30, request.POST.get("descripcion") or None)
            return _json_ok(cod_cupon=ident, mensaje="Cupón creado.")
        if _post_bool(request, "desactivar"):
            desactivar_cupon(cod_cupon)
        else:
            actualizar_cupon(cod_cupon, request.POST["nombre"], _post_decimal(request, "valor"), _post_bool(request, "activo", True))
        return _json_ok(mensaje="Cupón actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_promocion_admin(request, cod_promocion=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_promocion is None:
            ident = crear_promocion(request.POST["codigo"], request.POST["nombre"], request.POST["tipo_descuento"], _post_decimal(request, "valor"), request.POST["fecha_inicio"], request.POST["fecha_fin"], request.POST.get("descripcion") or None, _post_bool(request, "acumulable"))
            return _json_ok(cod_promocion=ident, mensaje="Promoción creada.")
        if _post_bool(request, "desactivar"):
            desactivar_promocion(cod_promocion)
        else:
            actualizar_promocion(cod_promocion, request.POST["nombre"], _post_decimal(request, "valor"), _post_bool(request, "activo", True))
        return _json_ok(mensaje="Promoción actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_promocion_producto_admin(request, cod_promocion):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        cod_producto = _post_int(request, "cod_producto")
        if _post_bool(request, "desasociar"):
            control_service.desasociar_promocion_producto(cod_promocion, cod_producto)
            return _json_ok(mensaje="Producto retirado de la promoción.")
        asociar_promocion_producto(cod_promocion, cod_producto)
        return _json_ok(mensaje="Producto asociado a la promoción.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_detalle_pedido_admin(request, cod_pedido):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPORT")
    if error:
        return error
    try:
        pedido, detalles, lotes = panel_service.detalle_pedido(cod_pedido)
        factura = getattr(pedido, "factura", None)
        return _json_ok(
            pedido={"cod_pedido": pedido.cod_pedido, "numero_pedido": pedido.numero_pedido, "estado": pedido.cod_estado_pedido_id, "cliente": pedido.cod_usuario.email, "total": _money(pedido.total), "direccion": pedido.cod_direccion_envio.linea1, "factura": factura.numero_factura if factura else None},
            detalles=[{"producto": d.cod_producto.nombre, "cantidad": d.cantidad, "precio_final": _money(d.precio_final_unitario), "subtotal": _money(d.subtotal_linea)} for d in detalles],
            lotes=[{"producto": l.cod_pedido_detalle.cod_producto.nombre, "lote": l.cod_lote.numero_lote, "cantidad": l.cantidad, "pvp_historico": _money(l.pvp_unitario_historico), "subtotal": _money(l.subtotal_linea_lote)} for l in lotes],
        )
    except Exception as exc:
        return _json_error(_safe_error(exc, "Pedido no encontrado."), status=404)


@login_required(login_url="/login/")
@require_GET
def api_pagos_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    data = panel_service.listar_pagos()
    return _json_ok(
        transacciones=[{"cod_transaccion": t.cod_transaccion, "pedido": t.cod_pedido.numero_pedido, "monto": _money(t.monto), "estado": t.cod_estado_pago_id, "fecha": _dt(t.fecha_creacion)} for t in data["transacciones"]],
        autorizaciones=[{"cod_autorizacion": a.cod_autorizacion, "transaccion": a.cod_transaccion_id, "monto": _money(a.monto_autorizado), "fecha": _dt(a.fecha_autorizacion)} for a in data["autorizaciones"]],
        reembolsos=[{"cod_reembolso": r.cod_reembolso, "transaccion": r.cod_transaccion_id, "monto": _money(r.monto), "estado": r.estado, "fecha": _dt(r.fecha_reembolso)} for r in data["reembolsos"]],
        facturas=[{"cod_factura": f.cod_factura, "pedido": f.cod_pedido.numero_pedido, "numero_factura": f.numero_factura, "total": _money(f.total), "estado": f.estado, "fecha": _dt(f.fecha_emision)} for f in data["facturas"]],
        devoluciones=[{
            "cod_devolucion": d.cod_devolucion, "pedido": d.cod_pedido.numero_pedido,
            "cliente": d.cod_usuario.email, "estado": d.estado, "motivo": d.motivo,
            "fecha": _dt(d.fecha_creacion),
        } for d in Devolucion.objects.select_related("cod_pedido", "cod_usuario").order_by("-fecha_creacion")[:100]],
    )


@login_required(login_url="/login/")
@require_GET
def api_tracking_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER", "SUPPORT")
    if error:
        return error
    data = panel_service.listar_tracking()
    return _json_ok(
        envios=[{"cod_envio": e.cod_envio, "pedido": e.cod_pedido.numero_pedido, "tracking": e.numero_tracking, "estado": e.estado_envio or e.estado, "transportista": e.cod_transportista.nombre if e.cod_transportista else None, "entrega": _dt(e.fecha_entrega)} for e in data["envios"]],
        programaciones=[{"cod_programacion": p.cod_programacion, "cod_envio": p.cod_envio_id, "evento": p.cod_tipo_evento_id, "descripcion": p.descripcion, "fecha_programada": _dt(p.fecha_programada), "procesado": p.procesado, "orden": p.orden} for p in data["programaciones"]],
    )


@login_required(login_url="/login/")
@require_POST
def api_accion_tracking_admin(request):
    error = _exigir_roles(request, "WAREHOUSE_MANAGER")
    if error:
        return error
    try:
        if request.POST.get("accion") == "procesar":
            cantidad = procesar_tracking_pendiente()
            return _json_ok(procesados=cantidad, mensaje="Tracking pendiente procesado.")
        if request.POST.get("accion") == "estado_envio":
            actualizar_envio_estado(_post_int(request, "cod_envio"), request.POST["estado"], request.POST.get("comentario") or None)
            return _json_ok(mensaje="Estado de envío actualizado.")
        return _json_error("Acción de tracking no soportada.", status=400)
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_prime_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    data = panel_service.listar_prime()
    return _json_ok(
        planes=data["planes"],
        beneficios=[{"cod_beneficio": b.cod_beneficio, "plan": b.cod_plan.nombre, "codigo": b.codigo, "nombre": b.nombre, "valor": _money(b.valor), "descripcion": b.descripcion, "activo": b.activo} for b in data["beneficios"]],
        membresias=[{"cod_membresia": m.cod_membresia, "usuario": m.cod_usuario.email, "plan": m.cod_plan.nombre, "estado": m.cod_estado_membresia_id, "inicio": m.fecha_inicio.isoformat(), "fin": m.fecha_fin.isoformat()} for m in data["membresias"]],
        usos=[{"cod_uso_beneficio": u.cod_uso_beneficio, "usuario": u.cod_usuario.email, "beneficio": u.cod_beneficio.nombre, "pedido": u.cod_pedido_id, "valor": _money(u.valor_aplicado), "fecha": _dt(u.fecha_uso)} for u in data["usos"]],
    )
