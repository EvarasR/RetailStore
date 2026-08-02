"""Servicios de interaccion de cliente con el catalogo.

Las reglas y escrituras viven en funciones PostgreSQL; este modulo solo
encapsula su invocacion para que las views no ejecuten SQL directamente.
"""

from apps.core.services.sql_service import ejecutar_funcion_scalar


def registrar_pregunta_producto(cod_usuario, cod_producto, pregunta):
    return ejecutar_funcion_scalar(
        "fn_registrar_pregunta_producto",
        [cod_usuario, cod_producto, pregunta],
        ["BIGINT", "BIGINT", "TEXT"],
        usar_transaccion=True,
    )
