from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def crear_compra_recurrente(cod_usuario, nombre, frecuencia_dias, proxima_ejecucion):
    return ejecutar_funcion_scalar(
        "fn_crear_compra_recurrente",
        [cod_usuario, nombre, frecuencia_dias, proxima_ejecucion],
        ["BIGINT", "TEXT", "INTEGER", "DATE"],
        usar_transaccion=True,
    )


def agregar_producto_compra_recurrente(cod_compra_recurrente, cod_producto, cantidad):
    return ejecutar_funcion_void(
        "fn_agregar_producto_compra_recurrente",
        [cod_compra_recurrente, cod_producto, cantidad],
        ["BIGINT", "BIGINT", "INTEGER"],
    )


def preparar_carrito_compra_recurrente(cod_compra_recurrente):
    return ejecutar_funcion_scalar(
        "fn_preparar_carrito_compra_recurrente",
        [cod_compra_recurrente],
        ["BIGINT"],
        usar_transaccion=True,
    )


def actualizar_compra_recurrente(cod_compra_recurrente, nombre, frecuencia_dias, proxima_ejecucion, activa=True):
    return ejecutar_funcion_void(
        "fn_actualizar_compra_recurrente",
        [cod_compra_recurrente, nombre, frecuencia_dias, proxima_ejecucion, activa],
        ["BIGINT", "TEXT", "INTEGER", "DATE", "BOOLEAN"],
        usar_transaccion=True,
    )


def agregar_contenido_biblioteca(cod_usuario, cod_contenido, dias_acceso=None):
    return ejecutar_funcion_scalar(
        "fn_agregar_contenido_biblioteca",
        [cod_usuario, cod_contenido, dias_acceso],
        ["BIGINT", "BIGINT", "INTEGER"],
        usar_transaccion=True,
    )
