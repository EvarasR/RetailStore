"""Consultas de lectura del panel administrativo.

Las mutaciones del panel se mantienen en los servicios especializados y llaman
funciones PostgreSQL. Este módulo evita que las vistas conozcan tablas o SQL.
"""

from django.db.models import Count, Sum

from apps.administracion.models import AlertaStock, Inventario, LoteInventario, ResumenVentaDiaria, SnapshotKpi
from apps.clientes.models import BeneficioMembresia, MembresiaUsuario, UsoBeneficio
from apps.core.models import EstadoPedido, Usuario
from apps.core.services.sql_service import ejecutar_funcion_scalar
from apps.operaciones.models import (
    AutorizacionPago,
    Envio,
    Factura,
    Pedido,
    PedidoDetalle,
    PedidoDetalleLote,
    ReembolsoPago,
    TrackingEventoProgramado,
    TransaccionPago,
)
from apps.proveedores.models import OrdenAbastecimiento, Proveedor, ProveedorContacto, ProductoProveedor


def listar_entidad(entidad, solo_activos=True):
    """Lista una entidad permitida por fn_listar_entidad_administrable."""
    return ejecutar_funcion_scalar(
        "fn_listar_entidad_administrable",
        [entidad, solo_activos],
        ["TEXT", "BOOLEAN"],
    ) or []


def resumen_panel():
    total_ventas = Pedido.objects.aggregate(total=Sum("total"))["total"] or 0
    return {
        "tarjetas": {
            "productos": len(listar_entidad("producto", False)),
            "productos_publicados": sum(1 for p in listar_entidad("producto", True) if p.get("cod_estado_producto") == "PUBLICADO"),
            "pedidos": Pedido.objects.count(),
            "ventas": total_ventas,
            "clientes": Usuario.objects.filter(activo=True).count(),
            "proveedores": len(listar_entidad("proveedor", True)),
            "alertas_stock": AlertaStock.objects.filter(atendida=False).count(),
        },
        "estados_pedido": list(Pedido.objects.values("cod_estado_pedido_id").annotate(total=Count("cod_pedido")).order_by("cod_estado_pedido_id")),
        "ventas_diarias": list(ResumenVentaDiaria.objects.order_by("-fecha")[:10]),
        "kpis": list(SnapshotKpi.objects.order_by("-fecha_snapshot")[:8]),
    }


def listar_inventario():
    return list(Inventario.objects.select_related("cod_producto", "cod_almacen").order_by("cod_producto__nombre")[:120])


def listar_lotes():
    return list(LoteInventario.objects.select_related("cod_producto", "cod_almacen", "cod_proveedor").order_by("fecha_recepcion", "cod_lote")[:160])


def listar_alertas_stock():
    return list(AlertaStock.objects.select_related("cod_producto", "cod_almacen").order_by("atendida", "-fecha_creacion")[:120])


def listar_ordenes_abastecimiento():
    return list(OrdenAbastecimiento.objects.select_related("cod_proveedor", "cod_almacen", "cod_pedido").order_by("-fecha_creacion")[:100])


def listar_contactos_proveedor(cod_proveedor):
    return list(ProveedorContacto.objects.filter(cod_proveedor_id=cod_proveedor).order_by("-principal", "nombre"))


def listar_relaciones_proveedor(cod_proveedor=None):
    qs = ProductoProveedor.objects.select_related("cod_producto", "cod_proveedor", "proveedorstock")
    if cod_proveedor:
        qs = qs.filter(cod_proveedor_id=cod_proveedor)
    return list(qs.order_by("cod_producto__nombre", "prioridad")[:200])


def listar_pedidos(estado=None):
    qs = Pedido.objects.select_related("cod_usuario", "cod_estado_pedido", "cod_metodo_envio", "cod_zona_entrega").order_by("-fecha_creacion")
    if estado:
        qs = qs.filter(cod_estado_pedido_id=estado)
    return list(qs[:100]), list(EstadoPedido.objects.order_by("orden"))


def detalle_pedido(cod_pedido):
    pedido = Pedido.objects.select_related("cod_usuario", "cod_direccion_envio", "cod_estado_pedido").get(cod_pedido=cod_pedido)
    return pedido, list(PedidoDetalle.objects.select_related("cod_producto").filter(cod_pedido_id=cod_pedido)), list(
        PedidoDetalleLote.objects.select_related("cod_lote", "cod_pedido_detalle__cod_producto").filter(cod_pedido_detalle__cod_pedido_id=cod_pedido)
    )


def listar_pagos():
    return {
        "transacciones": list(TransaccionPago.objects.select_related("cod_pedido", "cod_estado_pago").order_by("-fecha_creacion")[:100]),
        "autorizaciones": list(AutorizacionPago.objects.select_related("cod_transaccion").order_by("-fecha_autorizacion")[:100]),
        "reembolsos": list(ReembolsoPago.objects.select_related("cod_transaccion").order_by("-fecha_reembolso")[:100]),
        "facturas": list(Factura.objects.select_related("cod_pedido").order_by("-fecha_emision")[:100]),
    }


def listar_tracking():
    return {
        "envios": list(Envio.objects.select_related("cod_pedido", "cod_transportista").order_by("-fecha_creacion")[:100]),
        "programaciones": list(TrackingEventoProgramado.objects.select_related("cod_envio", "cod_tipo_evento").order_by("procesado", "fecha_programada")[:160]),
    }


def listar_prime():
    return {
        "planes": listar_entidad("plan_membresia", False),
        "beneficios": list(BeneficioMembresia.objects.select_related("cod_plan").order_by("cod_plan__nombre", "codigo")),
        "membresias": list(MembresiaUsuario.objects.select_related("cod_usuario", "cod_plan", "cod_estado_membresia").order_by("-fecha_creacion")[:100]),
        "usos": list(UsoBeneficio.objects.select_related("cod_usuario", "cod_beneficio", "cod_pedido").order_by("-fecha_uso")[:100]),
    }
