"""Lecturas y autorización del portal de proveedores.

El proveedor sólo puede acceder a su propia organización. Las modificaciones
de stock se hacen mediante proveedor_service y fn_actualizar_stock_proveedor.
"""

from apps.core.models import UsuarioRol
from apps.proveedores.models import (
    HistorialProveedor,
    OrdenAbastecimiento,
    ProductoProveedor,
    Proveedor,
    UsuarioProveedor,
)


def es_usuario_proveedor(usuario):
    return UsuarioRol.objects.filter(
        cod_usuario=usuario,
        cod_rol__nombre__in=("PROVEEDOR", "SUPPLIER_MANAGER"),
        cod_rol__activo=True,
    ).exists()


def obtener_proveedor_usuario(usuario):
    """Resuelve sólo una relación activa y explícita usuario_proveedor."""
    relacion = UsuarioProveedor.objects.select_related("cod_proveedor").filter(
        cod_usuario=usuario,
        activo=True,
        cod_proveedor__activo=True,
    ).first()
    return relacion.cod_proveedor if relacion else None


def puede_gestionar_proveedor(usuario, cod_proveedor):
    if getattr(usuario, "is_staff", False):
        return Proveedor.objects.filter(cod_proveedor=cod_proveedor, activo=True).exists()
    proveedor = obtener_proveedor_usuario(usuario)
    return bool(proveedor and proveedor.cod_proveedor == cod_proveedor and es_usuario_proveedor(usuario))


def datos_panel_proveedor(cod_proveedor):
    proveedor = Proveedor.objects.get(cod_proveedor=cod_proveedor, activo=True)
    productos = list(
        ProductoProveedor.objects.select_related("cod_producto", "proveedorstock")
        .filter(cod_proveedor=proveedor)
        .order_by("cod_producto__nombre")
    )
    ordenes = list(
        OrdenAbastecimiento.objects.filter(cod_proveedor=proveedor)
        .select_related("cod_almacen", "cod_pedido")
        .order_by("-fecha_creacion")[:100]
    )
    historial = list(
        HistorialProveedor.objects.filter(cod_proveedor=proveedor).order_by("-fecha_evento")[:50]
    )
    return proveedor, productos, ordenes, historial
