from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
    ejecutar_funcion_tabla,
)


def obtener_o_crear_carrito_activo(cod_usuario):
    return ejecutar_funcion_scalar(
        "fn_obtener_o_crear_carrito_activo",
        [cod_usuario],
        ["BIGINT"],
        usar_transaccion=True,
    )


# Alias por si en las vistas prefieres el nombre corto.
def obtener_o_crear_carrito(cod_usuario):
    return obtener_o_crear_carrito_activo(cod_usuario)


def agregar_producto_carrito(cod_usuario, cod_producto, cantidad):
    """
    Función real:
        fn_agregar_producto_carrito(p_cod_usuario BIGINT, p_cod_producto BIGINT, p_cantidad INTEGER)
    """
    return ejecutar_funcion_scalar(
        "fn_agregar_producto_carrito",
        [cod_usuario, cod_producto, cantidad],
        ["BIGINT", "BIGINT", "INTEGER"],
        usar_transaccion=True,
    )


def actualizar_cantidad_carrito(cod_usuario, cod_producto, cantidad):
    """
    Ojo: la función real recibe cod_usuario, NO cod_carrito.
    """
    return ejecutar_funcion_void(
        "fn_actualizar_cantidad_carrito",
        [cod_usuario, cod_producto, cantidad],
        ["BIGINT", "BIGINT", "INTEGER"],
    )


def eliminar_producto_carrito(cod_usuario, cod_producto):
    """
    Ojo: la función real recibe cod_usuario, NO cod_carrito.
    """
    return ejecutar_funcion_void(
        "fn_eliminar_producto_carrito",
        [cod_usuario, cod_producto],
        ["BIGINT", "BIGINT"],
    )


def limpiar_carrito(cod_carrito):
    return ejecutar_funcion_void(
        "fn_limpiar_carrito",
        [cod_carrito],
        ["BIGINT"],
    )


def total_carrito(cod_carrito):
    return ejecutar_funcion_scalar(
        "fn_total_carrito",
        [cod_carrito],
        ["BIGINT"],
    )


# Alias por compatibilidad con nombres anteriores.
def calcular_total_carrito(cod_carrito):
    return total_carrito(cod_carrito)


def validar_limite_retail(cod_usuario, cod_producto, cantidad):
    return ejecutar_funcion_void(
        "fn_validar_limite_retail",
        [cod_usuario, cod_producto, cantidad],
        ["BIGINT", "BIGINT", "INTEGER"],
    )


def obtener_limite_retail(cod_usuario, cod_producto):
    filas = ejecutar_funcion_tabla(
        "fn_obtener_limite_retail",
        [cod_usuario, cod_producto],
        ["BIGINT", "BIGINT"],
    )
    return filas[0] if filas else None


def validar_checkout_carrito(cod_usuario):
    return ejecutar_funcion_scalar(
        "fn_validar_checkout_carrito",
        [cod_usuario],
        ["BIGINT"],
    )
