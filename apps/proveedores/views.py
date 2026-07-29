from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_GET, require_POST

from apps.proveedores.models import Proveedor, ProductoProveedor, ProveedorStock
from apps.proveedores.services.proveedor_service import (
    actualizar_stock_proveedor,
    consultar_proveedores_para_faltante,
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


@login_required(login_url="/login/")
@require_POST
def api_actualizar_stock_proveedor(request):
    error = _exigir_admin(request)
    if error:
        return error

    try:
        cod_producto_proveedor = int(request.POST.get("cod_producto_proveedor"))
        cantidad = int(request.POST.get("cantidad_disponible"))
        actualizar_stock_proveedor(cod_producto_proveedor, cantidad)
        return _json_ok(mensaje="Stock de proveedor actualizado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)
