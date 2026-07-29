from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def generar_tracking_inicial(cod_pedido, cod_metodo_envio=None):
    return ejecutar_funcion_scalar(
        "fn_generar_tracking_inicial",
        [cod_pedido, cod_metodo_envio],
        ["BIGINT", "BIGINT"],
        usar_transaccion=True,
    )


def registrar_evento_tracking(
    cod_pedido,
    cod_tipo_evento,
    descripcion,
    ubicacion="Centro de operación",
    visible_cliente=True,
):
    """
    Función real:
        fn_registrar_evento_tracking(p_cod_pedido, p_cod_tipo_evento, p_descripcion, ...)
    Ojo: recibe cod_pedido, no cod_envio.
    """
    return ejecutar_funcion_scalar(
        "fn_registrar_evento_tracking",
        [cod_pedido, cod_tipo_evento, descripcion, ubicacion, visible_cliente],
        ["BIGINT", "VARCHAR", "TEXT", "TEXT", "BOOLEAN"],
        usar_transaccion=True,
    )


def actualizar_estado_pedido(cod_pedido, cod_estado_pedido, comentario=None):
    return ejecutar_funcion_void(
        "fn_actualizar_estado_pedido",
        [cod_pedido, cod_estado_pedido, comentario],
        ["BIGINT", "VARCHAR", "TEXT"],
    )


def marcar_pedido_entregado(cod_pedido, comentario="Pedido entregado al cliente"):
    return ejecutar_funcion_void(
        "fn_marcar_pedido_entregado",
        [cod_pedido, comentario],
        ["BIGINT", "TEXT"],
    )
