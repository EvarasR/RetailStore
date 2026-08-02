from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
)


def crear_pedido_desde_carrito(cod_usuario, cod_direccion_envio, cod_metodo_envio=None):
    """
    Función real:
        fn_crear_pedido_desde_carrito(p_cod_usuario BIGINT, p_cod_direccion_envio BIGINT, p_cod_metodo_envio BIGINT DEFAULT NULL)

    No recibe cupón. El cupón se aplica después con fn_aplicar_cupon_pedido.
    """
    return ejecutar_funcion_scalar(
        "fn_crear_pedido_desde_carrito",
        [cod_usuario, cod_direccion_envio, cod_metodo_envio],
        ["BIGINT", "BIGINT", "BIGINT"],
        usar_transaccion=True,
    )


def cancelar_pedido(cod_pedido, motivo="Cancelación solicitada"):
    return ejecutar_funcion_void(
        "fn_cancelar_pedido",
        [cod_pedido, motivo],
        ["BIGINT", "TEXT"],
    )


def actualizar_estado_pedido(cod_pedido, cod_estado_pedido, comentario=None):
    return ejecutar_funcion_void(
        "fn_actualizar_estado_pedido",
        [cod_pedido, cod_estado_pedido, comentario],
        ["BIGINT", "VARCHAR", "TEXT"],
    )


def recalcular_total_pedido(cod_pedido):
    return ejecutar_funcion_void(
        "fn_recalcular_total_pedido",
        [cod_pedido],
        ["BIGINT"],
    )


def cotizar_producto_por_lotes(cod_usuario, cod_producto, cantidad):
    return ejecutar_funcion_scalar(
        "fn_cotizar_producto_por_lotes",
        [cod_usuario, cod_producto, cantidad],
        ["BIGINT", "BIGINT", "INTEGER"],
    )


def calcular_precio_final_item(cod_usuario, cod_producto, cantidad, precio_base=None, codigo_cupon=None):
    return ejecutar_funcion_scalar(
        "fn_calcular_precio_final_item",
        [cod_usuario, cod_producto, cantidad, precio_base, codigo_cupon],
        ["BIGINT", "BIGINT", "INTEGER", "NUMERIC", "TEXT"],
    )


def calcular_costo_envio(cod_usuario, cod_metodo_envio, cod_zona_entrega, subtotal):
    return ejecutar_funcion_scalar(
        "fn_calcular_costo_envio",
        [cod_usuario, cod_metodo_envio, cod_zona_entrega, subtotal],
        ["BIGINT", "BIGINT", "BIGINT", "NUMERIC"],
    )


def aplicar_cupon_pedido(cod_pedido, codigo_cupon):
    return ejecutar_funcion_scalar(
        "fn_aplicar_cupon_pedido",
        [cod_pedido, codigo_cupon],
        ["BIGINT", "TEXT"],
        usar_transaccion=True,
    )


def solicitar_devolucion_total(cod_pedido, motivo, descripcion=None):
    return ejecutar_funcion_scalar(
        "fn_solicitar_devolucion_total",
        [cod_pedido, motivo, descripcion],
        ["BIGINT", "TEXT", "TEXT"],
        usar_transaccion=True,
    )


def aprobar_devolucion(cod_devolucion, comentario=None):
    return ejecutar_funcion_void(
        "fn_aprobar_devolucion",
        [cod_devolucion, comentario],
        ["BIGINT", "TEXT"],
    )
