from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void
from apps.operaciones.models import TrackingEvento


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


def programar_tracking_pedido(cod_pedido):
    return ejecutar_funcion_scalar(
        "fn_programar_tracking_pedido", [cod_pedido], ["BIGINT"], usar_transaccion=True
    )


def procesar_tracking_pendiente(fecha_hasta=None):
    if fecha_hasta is None:
        return ejecutar_funcion_scalar(
            "fn_procesar_tracking_pendiente", [], [], usar_transaccion=True
        )
    return ejecutar_funcion_scalar(
        "fn_procesar_tracking_pendiente", [fecha_hasta], ["TIMESTAMPTZ"], usar_transaccion=True
    )


def actualizar_envio_estado(cod_envio, estado, comentario=None):
    return ejecutar_funcion_void(
        "fn_actualizar_envio_estado",
        [cod_envio, estado, comentario],
        ["BIGINT", "VARCHAR", "TEXT"],
        usar_transaccion=True,
    )


def consultar_tracking_persistente(cod_pedido):
    """Lectura ORM del historial ya persistido por las funciones SQL."""
    return list(
        TrackingEvento.objects.filter(cod_envio__cod_pedido_id=cod_pedido)
        .order_by("fecha_evento", "orden", "cod_tracking_evento")
        .values(
            "cod_tracking_evento",
            "cod_envio_id",
            "cod_tipo_evento_id",
            "cod_tipo_evento__nombre",
            "descripcion",
            "ubicacion",
            "visible_cliente",
            "fecha_evento",
            "orden",
        )
    )
