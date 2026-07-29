from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def usuario_tiene_membresia_activa(cod_usuario):
    return ejecutar_funcion_scalar(
        "fn_usuario_tiene_membresia_activa",
        [cod_usuario],
        ["BIGINT"],
    )


def crear_plan_membresia(nombre, precio_mensual, duracion_dias=30):
    return ejecutar_funcion_scalar(
        "fn_crear_plan_membresia",
        [nombre, precio_mensual, duracion_dias],
        ["TEXT", "NUMERIC", "INTEGER"],
        usar_transaccion=True,
    )


def desactivar_plan_membresia(cod_plan):
    return ejecutar_funcion_void(
        "fn_desactivar_plan_membresia",
        [cod_plan],
        ["BIGINT"],
    )


def activar_membresia_usuario(cod_usuario, cod_plan, renovacion_automatica=True):
    return ejecutar_funcion_scalar(
        "fn_activar_membresia_usuario",
        [cod_usuario, cod_plan, renovacion_automatica],
        ["BIGINT", "BIGINT", "BOOLEAN"],
        usar_transaccion=True,
    )
