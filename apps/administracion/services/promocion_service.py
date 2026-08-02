from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
)


def crear_cupon(
    codigo,
    nombre,
    tipo_descuento,
    valor,
    monto_minimo=0,
    usos_maximos=None,
    usos_por_usuario=1,
    dias_vigencia=30,
    descripcion=None,
):
    return ejecutar_funcion_scalar(
        "fn_crear_cupon",
        [
            codigo,
            nombre,
            tipo_descuento,
            valor,
            monto_minimo,
            usos_maximos,
            usos_por_usuario,
            dias_vigencia,
            descripcion,
        ],
        ["TEXT", "TEXT", "TEXT", "NUMERIC", "NUMERIC", "INTEGER", "INTEGER", "INTEGER", "TEXT"],
        usar_transaccion=True,
    )


def calcular_descuento_cupon(codigo_cupon, cod_usuario, subtotal):
    return ejecutar_funcion_scalar(
        "fn_calcular_descuento_cupon",
        [codigo_cupon, cod_usuario, subtotal],
        ["TEXT", "BIGINT", "NUMERIC"],
    )


def aplicar_cupon_pedido(cod_pedido, codigo_cupon):
    return ejecutar_funcion_scalar(
        "fn_aplicar_cupon_pedido",
        [cod_pedido, codigo_cupon],
        ["BIGINT", "TEXT"],
        usar_transaccion=True,
    )


def crear_promocion(
    codigo,
    nombre,
    tipo_descuento,
    valor,
    fecha_inicio,
    fecha_fin,
    descripcion=None,
    acumulable=False,
):
    return ejecutar_funcion_scalar(
        "fn_crear_promocion",
        [codigo, nombre, tipo_descuento, valor, fecha_inicio, fecha_fin, descripcion, acumulable],
        ["TEXT", "TEXT", "TEXT", "NUMERIC", "TIMESTAMPTZ", "TIMESTAMPTZ", "TEXT", "BOOLEAN"],
        usar_transaccion=True,
    )


def asociar_promocion_producto(cod_promocion, cod_producto):
    return ejecutar_funcion_void(
        "fn_asociar_promocion_producto",
        [cod_promocion, cod_producto],
        ["BIGINT", "BIGINT"],
    )


def actualizar_cupon(cod_cupon, nombre, valor, activo=True):
    return ejecutar_funcion_void(
        "fn_actualizar_cupon",
        [cod_cupon, nombre, valor, activo],
        ["BIGINT", "TEXT", "NUMERIC", "BOOLEAN"],
        usar_transaccion=True,
    )


def desactivar_cupon(cod_cupon):
    return ejecutar_funcion_void(
        "fn_desactivar_cupon", [cod_cupon], ["BIGINT"], usar_transaccion=True
    )


def actualizar_promocion(cod_promocion, nombre, valor, activo=True):
    return ejecutar_funcion_void(
        "fn_actualizar_promocion",
        [cod_promocion, nombre, valor, activo],
        ["BIGINT", "TEXT", "NUMERIC", "BOOLEAN"],
        usar_transaccion=True,
    )


def desactivar_promocion(cod_promocion):
    return ejecutar_funcion_void(
        "fn_desactivar_promocion", [cod_promocion], ["BIGINT"], usar_transaccion=True
    )
