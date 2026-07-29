from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def crear_ticket_soporte(cod_usuario, asunto, categoria, prioridad, mensaje):
    return ejecutar_funcion_scalar(
        "fn_crear_ticket_soporte",
        [cod_usuario, asunto, categoria, prioridad, mensaje],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "TEXT"],
        usar_transaccion=True,
    )


def responder_ticket_soporte(
    cod_ticket,
    cod_usuario,
    mensaje,
    interno=False,
    nuevo_estado="EN_PROCESO",
):
    return ejecutar_funcion_scalar(
        "fn_responder_ticket_soporte",
        [cod_ticket, cod_usuario, mensaje, interno, nuevo_estado],
        ["BIGINT", "BIGINT", "TEXT", "BOOLEAN", "TEXT"],
        usar_transaccion=True,
    )


def cerrar_ticket_soporte(cod_ticket, cod_usuario, mensaje="Ticket cerrado"):
    return ejecutar_funcion_void(
        "fn_cerrar_ticket_soporte",
        [cod_ticket, cod_usuario, mensaje],
        ["BIGINT", "BIGINT", "TEXT"],
    )
