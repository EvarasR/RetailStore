from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def refrescar_resumen_venta_diaria(fecha=None):
    if fecha is None:
        return ejecutar_funcion_void(
            "fn_refrescar_resumen_venta_diaria",
            [],
            [],
        )

    return ejecutar_funcion_void(
        "fn_refrescar_resumen_venta_diaria",
        [fecha],
        ["DATE"],
    )


def generar_snapshot_kpis():
    return ejecutar_funcion_void(
        "fn_generar_snapshot_kpis",
        [],
        [],
    )


def segmentar_clientes():
    return ejecutar_funcion_scalar(
        "fn_segmentar_clientes",
        [],
        [],
        usar_transaccion=True,
    )


def generar_recomendaciones_usuario(cod_usuario, limite=10):
    return ejecutar_funcion_scalar(
        "fn_generar_recomendaciones_usuario",
        [cod_usuario, limite],
        ["BIGINT", "INTEGER"],
        usar_transaccion=True,
    )
