from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.http import require_GET, require_POST

from apps.core.decorators import api_login_required
from apps.proveedores.models import Proveedor, ProductoProveedor, ProveedorStock
from apps.proveedores.services.proveedor_service import (
    actualizar_stock_proveedor,
    consultar_proveedores_para_faltante,
)
from apps.proveedores.services.portal_service import (
    datos_panel_proveedor,
    es_usuario_proveedor,
    obtener_proveedor_usuario,
    puede_gestionar_proveedor,
)


def _json_ok(**data):
    payload = {"ok": True}
    payload.update(data)
    return JsonResponse(payload)


def _json_error(mensaje, status=400):
    return JsonResponse({"ok": False, "mensaje": mensaje}, status=status)


def _safe_error(exc, mensaje="No se pudo completar la operación."):
    return str(exc) if settings.DEBUG else mensaje


def _es_admin(user):
    return user.is_authenticated and getattr(user, "is_staff", False)


def _exigir_admin(request):
    if not _es_admin(request.user):
        return _json_error("No tienes permisos para esta operación.", status=403)
    return None


def _exigir_proveedor(request):
    if _es_admin(request.user):
        return None
    if not es_usuario_proveedor(request.user) or not obtener_proveedor_usuario(request.user):
        return _json_error("No tienes permisos de proveedor.", status=403)
    return None


@login_required(login_url="/login/")
def panel_view(request):
    if _es_admin(request.user) or (es_usuario_proveedor(request.user) and obtener_proveedor_usuario(request.user)):
        return render(request, "proveedores/panel.html")
    return redirect("clientes:inicio")


@api_login_required
@require_GET
def api_mi_panel(request):
    error = _exigir_proveedor(request)
    if error:
        return error
    proveedor = obtener_proveedor_usuario(request.user)
    if _es_admin(request.user):
        cod = request.GET.get("cod_proveedor")
        if not cod:
            return _json_error("Un administrador debe indicar cod_proveedor.")
        proveedor = Proveedor.objects.filter(cod_proveedor=cod, activo=True).first()
    if not proveedor:
        return _json_error("Proveedor no asociado a este usuario.", status=403)
    proveedor, productos, ordenes, historial = datos_panel_proveedor(proveedor.cod_proveedor)
    return _json_ok(
        proveedor={"cod_proveedor": proveedor.cod_proveedor, "razon_social": proveedor.razon_social, "calificacion": str(proveedor.calificacion), "ciudad": proveedor.ciudad},
        productos=[{"cod_producto_proveedor": p.cod_producto_proveedor, "producto": p.cod_producto.nombre, "sku_proveedor": p.sku_proveedor, "costo_unitario": str(p.costo_unitario), "tiempo_entrega_dias": p.tiempo_entrega_dias, "prioridad": p.prioridad, "stock_disponible": getattr(getattr(p, "proveedorstock", None), "cantidad_disponible", 0), "activo": p.activo} for p in productos],
        ordenes=[{"cod_orden_abastecimiento": o.cod_orden_abastecimiento, "estado": o.estado, "almacen": o.cod_almacen.nombre if o.cod_almacen else None, "total_estimado": str(o.total_estimado), "fecha": o.fecha_creacion.isoformat()} for o in ordenes],
        historial=[{"evento": h.evento, "descripcion": h.descripcion, "fecha": h.fecha_evento.isoformat()} for h in historial],
    )


@login_required(login_url="/login/")
@require_GET
def api_lista_proveedores(request):
    error = _exigir_admin(request)
    if error:
        return error

    proveedores = Proveedor.objects.filter(activo=True).order_by("razon_social")[:100]
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
                "calificacion": str(p.calificacion),
            }
            for p in proveedores
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_proveedores_para_faltante(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error

    cantidad = int(request.GET.get("cantidad") or 1)
    try:
        proveedores = consultar_proveedores_para_faltante(cod_producto, cantidad)
        return _json_ok(proveedores=proveedores)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@api_login_required
@require_POST
def api_actualizar_stock_proveedor(request):
    try:
        cod_producto_proveedor = int(request.POST.get("cod_producto_proveedor"))
        cantidad = int(request.POST.get("cantidad_disponible"))
        relacion = ProductoProveedor.objects.select_related("cod_proveedor").filter(cod_producto_proveedor=cod_producto_proveedor).first()
        if not relacion or not puede_gestionar_proveedor(request.user, relacion.cod_proveedor_id):
            return _json_error("No puedes modificar el stock de este proveedor.", status=403)
        if cantidad < 0:
            return _json_error("La cantidad no puede ser negativa.")
        actualizar_stock_proveedor(cod_producto_proveedor, cantidad)
        return _json_ok(mensaje="Stock de proveedor actualizado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)
