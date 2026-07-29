from decimal import Decimal

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from apps.administracion.models import (
    AlertaStock,
    Categoria,
    Inventario,
    Producto,
    ProductoImagen,
    ResumenVentaDiaria,
    SnapshotKpi,
)
from apps.administracion.services.producto_service import (
    desactivar_producto,
    pausar_producto,
    publicar_producto,
    stock_disponible_producto,
)
from apps.clientes.models import Carrito
from apps.core.models import EstadoPedido, Usuario
from apps.operaciones.models import Pedido
from apps.proveedores.models import Proveedor
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


def _es_admin(user):
    return user.is_authenticated and getattr(user, "is_staff", False)


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
    if not _es_admin(request.user):
        return redirect("clientes:inicio")
    return render(request, "administracion/panel.html", {"sin_permiso": False})


@login_required(login_url="/login/")
@require_GET
def api_resumen(request):
    error = _exigir_admin(request)
    if error:
        return error

    total_ventas = Pedido.objects.aggregate(total=Sum("total"))["total"] or Decimal("0")
    estados = Pedido.objects.values("cod_estado_pedido_id").annotate(total=Count("cod_pedido")).order_by("cod_estado_pedido_id")
    ventas_dias = ResumenVentaDiaria.objects.order_by("-fecha")[:10]
    kpis = SnapshotKpi.objects.order_by("-fecha_snapshot")[:8]

    return _json_ok(
        tarjetas={
            "productos": Producto.objects.count(),
            "productos_publicados": Producto.objects.filter(cod_estado_producto_id="PUBLICADO").count(),
            "pedidos": Pedido.objects.count(),
            "ventas": _money(total_ventas),
            "clientes": Usuario.objects.filter(activo=True).count(),
            "proveedores": Proveedor.objects.filter(activo=True).count(),
            "alertas_stock": AlertaStock.objects.filter(atendida=False).count(),
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
    error = _exigir_admin(request)
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
            stock = stock_disponible_producto(p.cod_producto)
        except Exception:
            stock = None
        productos.append({
            "cod_producto": p.cod_producto,
            "sku": p.sku,
            "nombre": p.nombre,
            "categoria": p.cod_categoria.nombre,
            "marca": p.cod_marca.nombre,
            "precio": _money(p.precio_actual),
            "estado": p.cod_estado_producto_id,
            "stock": stock,
            "imagen": _imagen_producto(p.cod_producto),
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
        publicar_producto(cod_producto)
        return _json_ok(mensaje="Producto publicado.")
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
    error = _exigir_admin(request)
    if error:
        return error

    inventario = Inventario.objects.select_related("cod_producto", "cod_almacen").order_by("cod_producto__nombre")[:120]
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
    error = _exigir_admin(request)
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
    error = _exigir_admin(request)
    if error:
        return error

    estado = request.POST.get("estado") or ""
    comentario = request.POST.get("comentario") or "Cambio desde panel administrativo"
    try:
        actualizar_estado_pedido(cod_pedido, estado, comentario)
        return _json_ok(mensaje="Estado actualizado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_proveedores_admin(request):
    error = _exigir_admin(request)
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
