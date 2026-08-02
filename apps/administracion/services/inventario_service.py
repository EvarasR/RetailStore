from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
)


def crear_almacen(nombre, direccion, ciudad, provincia):
    return ejecutar_funcion_scalar(
        "fn_crear_almacen",
        [nombre, direccion, ciudad, provincia],
        ["TEXT", "TEXT", "TEXT", "TEXT"],
        usar_transaccion=True,
    )


def crear_o_actualizar_inventario(
    cod_producto,
    cod_almacen,
    stock_total,
    stock_minimo=0,
    stock_maximo=None,
):
    return ejecutar_funcion_scalar(
        "fn_crear_o_actualizar_inventario",
        [cod_producto, cod_almacen, stock_total, stock_minimo, stock_maximo],
        ["BIGINT", "BIGINT", "INTEGER", "INTEGER", "INTEGER"],
        usar_transaccion=True,
    )


def eliminar_inventario_si_sin_stock(cod_producto, cod_almacen):
    return ejecutar_funcion_void(
        "fn_eliminar_inventario_si_sin_stock",
        [cod_producto, cod_almacen],
        ["BIGINT", "BIGINT"],
    )


def registrar_movimiento_inventario(
    cod_producto,
    cod_almacen,
    cod_tipo_movimiento,
    cantidad,
    referencia_tipo=None,
    referencia_id=None,
    observacion=None,
):
    return ejecutar_funcion_void(
        "fn_registrar_movimiento_inventario",
        [
            cod_producto,
            cod_almacen,
            cod_tipo_movimiento,
            cantidad,
            referencia_tipo,
            referencia_id,
            observacion,
        ],
        ["BIGINT", "BIGINT", "VARCHAR", "INTEGER", "VARCHAR", "BIGINT", "TEXT"],
    )


def reservar_stock(cod_usuario, cod_producto, cantidad, cod_pedido=None):
    return ejecutar_funcion_scalar(
        "fn_reservar_stock",
        [cod_usuario, cod_producto, cantidad, cod_pedido],
        ["BIGINT", "BIGINT", "INTEGER", "BIGINT"],
        usar_transaccion=True,
    )


def consumir_reservas_pedido(cod_pedido):
    return ejecutar_funcion_void(
        "fn_consumir_reservas_pedido",
        [cod_pedido],
        ["BIGINT"],
    )


def liberar_reservas_pedido(cod_pedido):
    return ejecutar_funcion_void(
        "fn_liberar_reservas_pedido",
        [cod_pedido],
        ["BIGINT"],
    )


def ajustar_inventario(cod_producto, cod_almacen, nuevo_stock_total, observacion="Ajuste manual controlado"):
    return ejecutar_funcion_void(
        "fn_ajustar_inventario",
        [cod_producto, cod_almacen, nuevo_stock_total, observacion],
        ["BIGINT", "BIGINT", "INTEGER", "TEXT"],
    )


def expirar_reservas_vencidas():
    return ejecutar_funcion_scalar(
        "fn_expirar_reservas_vencidas",
        [],
        [],
        usar_transaccion=True,
    )


def crear_lote_inventario(
    cod_producto,
    cod_almacen,
    cantidad_recibida,
    costo_unitario,
    numero_lote=None,
    cod_proveedor=None,
    cod_orden_abastecimiento_detalle=None,
    fecha_recepcion=None,
    fecha_vencimiento=None,
):
    """Crea un lote; PostgreSQL calcula el PVP y sincroniza inventario."""
    return ejecutar_funcion_scalar(
        "fn_crear_lote_inventario",
        [
            cod_producto, cod_almacen, cantidad_recibida, costo_unitario,
            numero_lote, cod_proveedor, cod_orden_abastecimiento_detalle,
            fecha_recepcion, fecha_vencimiento,
        ],
        ["BIGINT", "BIGINT", "INTEGER", "NUMERIC", "TEXT", "BIGINT", "BIGINT", "TIMESTAMPTZ", "TIMESTAMPTZ"],
        usar_transaccion=True,
    )


def cotizar_stock_por_lotes(cod_usuario, cod_producto, cantidad):
    return ejecutar_funcion_scalar(
        "fn_cotizar_producto_por_lotes",
        [cod_usuario, cod_producto, cantidad],
        ["BIGINT", "BIGINT", "INTEGER"],
    )


def reservar_stock_por_lotes(cod_usuario, cod_producto, cantidad, cod_pedido=None, cod_pedido_detalle=None):
    return ejecutar_funcion_scalar(
        "fn_reservar_stock_por_lotes",
        [cod_usuario, cod_producto, cantidad, cod_pedido, cod_pedido_detalle],
        ["BIGINT", "BIGINT", "INTEGER", "BIGINT", "BIGINT"],
        usar_transaccion=True,
    )


def consumir_reservas_lote_pedido(cod_pedido):
    return ejecutar_funcion_void(
        "fn_consumir_reservas_lote_pedido", [cod_pedido], ["BIGINT"], usar_transaccion=True
    )


def liberar_reservas_lote_pedido(cod_pedido):
    return ejecutar_funcion_void(
        "fn_liberar_reservas_lote_pedido", [cod_pedido], ["BIGINT"], usar_transaccion=True
    )


def recalcular_inventario_desde_lotes(cod_producto=None, cod_almacen=None):
    return ejecutar_funcion_void(
        "fn_recalcular_inventario_desde_lotes",
        [cod_producto, cod_almacen],
        ["BIGINT", "BIGINT"],
        usar_transaccion=True,
    )


def stock_proyectado_producto_almacen(cod_producto, cod_almacen):
    return ejecutar_funcion_scalar(
        "fn_stock_proyectado_producto_almacen",
        [cod_producto, cod_almacen],
        ["BIGINT", "BIGINT"],
    )


def cantidad_pendiente_abastecimiento(cod_producto, cod_almacen=None):
    return ejecutar_funcion_scalar(
        "fn_cantidad_pendiente_abastecimiento",
        [cod_producto, cod_almacen],
        ["BIGINT", "BIGINT"],
    )


def generar_reposicion_automatica(cod_producto, cod_almacen):
    return ejecutar_funcion_scalar(
        "fn_generar_reposicion_automatica",
        [cod_producto, cod_almacen],
        ["BIGINT", "BIGINT"],
        usar_transaccion=True,
    )


def recalcular_reposicion_producto(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_recalcular_reposicion_producto", [cod_producto], ["BIGINT"], usar_transaccion=True
    )


def resolver_alerta_stock(cod_alerta, observacion=None):
    return ejecutar_funcion_void(
        "fn_resolver_alerta_stock", [cod_alerta, observacion], ["BIGINT", "TEXT"], usar_transaccion=True
    )
