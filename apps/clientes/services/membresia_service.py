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


def calcular_descuento_prime(cod_usuario, precio_base):
    return ejecutar_funcion_scalar(
        "fn_calcular_descuento_prime",
        [cod_usuario, precio_base],
        ["BIGINT", "NUMERIC"],
    )


def registrar_uso_beneficio(cod_usuario, cod_beneficio, cod_pedido, valor_aplicado):
    """Registra solo un beneficio aplicado realmente por PostgreSQL."""
    return ejecutar_funcion_scalar(
        "fn_registrar_uso_beneficio",
        [cod_usuario, cod_beneficio, cod_pedido, valor_aplicado],
        ["BIGINT", "BIGINT", "BIGINT", "NUMERIC"],
        usar_transaccion=True,
    )


def crear_beneficio_membresia(cod_plan, codigo, nombre, valor=None, descripcion=None):
    return ejecutar_funcion_scalar(
        "fn_crear_beneficio_membresia", [cod_plan, codigo, nombre, valor, descripcion],
        ["BIGINT", "VARCHAR", "TEXT", "NUMERIC", "TEXT"], usar_transaccion=True,
    )


def actualizar_beneficio_membresia(cod_beneficio, nombre, valor, descripcion, activo=True):
    return ejecutar_funcion_void(
        "fn_actualizar_beneficio_membresia", [cod_beneficio, nombre, valor, descripcion, activo],
        ["BIGINT", "TEXT", "NUMERIC", "TEXT", "BOOLEAN"], usar_transaccion=True,
    )


def desactivar_beneficio_membresia(cod_beneficio):
    return ejecutar_funcion_void("fn_desactivar_beneficio_membresia", [cod_beneficio], ["BIGINT"], usar_transaccion=True)
