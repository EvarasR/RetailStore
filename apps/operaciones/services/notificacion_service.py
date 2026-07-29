from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def crear_notificacion(cod_usuario, tipo, titulo, mensaje, url_accion=None):
    return ejecutar_funcion_scalar(
        "fn_crear_notificacion",
        [cod_usuario, tipo, titulo, mensaje, url_accion],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "TEXT"],
        usar_transaccion=True,
    )


def marcar_notificacion_leida(cod_notificacion):
    return ejecutar_funcion_void(
        "fn_marcar_notificacion_leida",
        [cod_notificacion],
        ["BIGINT"],
    )


def encolar_email(cod_usuario, destinatario, asunto, cuerpo, fecha_programada=None):
    if fecha_programada is None:
        # Usamos la firma con 4 parámetros para que PostgreSQL aplique DEFAULT now().
        return ejecutar_funcion_scalar(
            "fn_encolar_email",
            [cod_usuario, destinatario, asunto, cuerpo],
            ["BIGINT", "TEXT", "TEXT", "TEXT"],
            usar_transaccion=True,
        )

    return ejecutar_funcion_scalar(
        "fn_encolar_email",
        [cod_usuario, destinatario, asunto, cuerpo, fecha_programada],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "TIMESTAMPTZ"],
        usar_transaccion=True,
    )


def marcar_email_enviado(cod_email):
    return ejecutar_funcion_void(
        "fn_marcar_email_enviado",
        [cod_email],
        ["BIGINT"],
    )


def marcar_email_fallido(cod_email, error):
    return ejecutar_funcion_void(
        "fn_marcar_email_fallido",
        [cod_email, error],
        ["BIGINT", "TEXT"],
    )
