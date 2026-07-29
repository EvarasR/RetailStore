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
