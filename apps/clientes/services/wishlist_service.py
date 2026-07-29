from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def obtener_o_crear_wishlist_default(cod_usuario):
    return ejecutar_funcion_scalar(
        "fn_obtener_o_crear_wishlist_default",
        [cod_usuario],
        ["BIGINT"],
        usar_transaccion=True,
    )


def agregar_a_wishlist(cod_usuario, cod_producto, cod_wishlist=None):
    return ejecutar_funcion_void(
        "fn_agregar_a_wishlist",
        [cod_usuario, cod_producto, cod_wishlist],
        ["BIGINT", "BIGINT", "BIGINT"],
    )


def quitar_de_wishlist(cod_usuario, cod_producto, cod_wishlist=None):
    return ejecutar_funcion_void(
        "fn_quitar_de_wishlist",
        [cod_usuario, cod_producto, cod_wishlist],
        ["BIGINT", "BIGINT", "BIGINT"],
    )
