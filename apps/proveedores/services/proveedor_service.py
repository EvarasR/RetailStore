from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
    ejecutar_funcion_tabla,
)


def crear_proveedor(
    ruc,
    razon_social,
    nombre_comercial,
    email,
    telefono=None,
    direccion=None,
    ciudad=None,
    provincia=None,
):
    return ejecutar_funcion_scalar(
        "fn_crear_proveedor",
        [ruc, razon_social, nombre_comercial, email, telefono, direccion, ciudad, provincia],
        ["TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT"],
        usar_transaccion=True,
    )


def actualizar_proveedor(
    cod_proveedor,
    razon_social=None,
    nombre_comercial=None,
    email=None,
    telefono=None,
    direccion=None,
    ciudad=None,
    provincia=None,
    calificacion=None,
    activo=None,
):
    return ejecutar_funcion_void(
        "fn_actualizar_proveedor",
        [
            cod_proveedor,
            razon_social,
            nombre_comercial,
            email,
            telefono,
            direccion,
            ciudad,
            provincia,
            calificacion,
            activo,
        ],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "NUMERIC", "BOOLEAN"],
    )


def eliminar_proveedor_logico(cod_proveedor):
    return ejecutar_funcion_void(
        "fn_eliminar_proveedor_logico",
        [cod_proveedor],
        ["BIGINT"],
    )


def asociar_producto_proveedor(
    cod_producto,
    cod_proveedor,
    sku_proveedor,
    costo_unitario,
    precio_sugerido=None,
    tiempo_entrega_dias=3,
    prioridad=100,
    pedido_minimo=1,
    pedido_maximo=None,
    cantidad_disponible=0,
):
    return ejecutar_funcion_scalar(
        "fn_asociar_producto_proveedor",
        [
            cod_producto,
            cod_proveedor,
            sku_proveedor,
            costo_unitario,
            precio_sugerido,
            tiempo_entrega_dias,
            prioridad,
            pedido_minimo,
            pedido_maximo,
            cantidad_disponible,
        ],
        ["BIGINT", "BIGINT", "TEXT", "NUMERIC", "NUMERIC", "INTEGER", "INTEGER", "INTEGER", "INTEGER", "INTEGER"],
        usar_transaccion=True,
    )


def actualizar_stock_proveedor(cod_producto_proveedor, cantidad_disponible):
    return ejecutar_funcion_void(
        "fn_actualizar_stock_proveedor",
        [cod_producto_proveedor, cantidad_disponible],
        ["BIGINT", "INTEGER"],
    )


def contar_proveedores_activos_producto(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_contar_proveedores_activos_producto",
        [cod_producto],
        ["BIGINT"],
    )


def consultar_proveedores_para_faltante(cod_producto, cantidad_faltante):
    return ejecutar_funcion_tabla(
        "fn_consultar_proveedores_para_faltante",
        [cod_producto, cantidad_faltante],
        ["BIGINT", "INTEGER"],
    )


def generar_ordenes_abastecimiento(cod_pedido, cod_producto, cantidad_faltante):
    return ejecutar_funcion_scalar(
        "fn_generar_ordenes_abastecimiento",
        [cod_pedido, cod_producto, cantidad_faltante],
        ["BIGINT", "BIGINT", "INTEGER"],
        usar_transaccion=True,
    )


def recibir_orden_abastecimiento(
    cod_orden_abastecimiento,
    cod_almacen,
    observacion="Recepción de orden de abastecimiento",
):
    return ejecutar_funcion_void(
        "fn_recibir_orden_abastecimiento",
        [cod_orden_abastecimiento, cod_almacen, observacion],
        ["BIGINT", "BIGINT", "TEXT"],
    )


def cancelar_orden_abastecimiento(cod_orden_abastecimiento, motivo="Orden cancelada"):
    return ejecutar_funcion_void(
        "fn_cancelar_orden_abastecimiento",
        [cod_orden_abastecimiento, motivo],
        ["BIGINT", "TEXT"],
    )
