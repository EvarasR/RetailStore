from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
)


def registrar_metodo_pago_simulado(
    cod_usuario,
    numero_tarjeta,
    titular,
    exp_mes,
    exp_anio,
    cvv,
    saldo_disponible=1000,
    limite_diario=1000,
):
    return ejecutar_funcion_scalar(
        "fn_registrar_metodo_pago_simulado",
        [
            cod_usuario,
            numero_tarjeta,
            titular,
            exp_mes,
            exp_anio,
            cvv,
            saldo_disponible,
            limite_diario,
        ],
        ["BIGINT", "TEXT", "TEXT", "INTEGER", "INTEGER", "TEXT", "NUMERIC", "NUMERIC"],
        usar_transaccion=True,
    )


def autorizar_pago_simulado(cod_pedido, cod_metodo_pago, idempotency_key):
    return ejecutar_funcion_scalar(
        "fn_autorizar_pago_simulado",
        [cod_pedido, cod_metodo_pago, idempotency_key],
        ["BIGINT", "BIGINT", "TEXT"],
        usar_transaccion=True,
    )


def capturar_pago_simulado(cod_transaccion):
    """La captura, factura e idempotencia se validan en fn_capturar_pago_simulado."""
    return ejecutar_funcion_void(
        "fn_capturar_pago_simulado",
        [cod_transaccion],
        ["BIGINT"],
    )


def capturar_pago_idempotente(cod_transaccion):
    """Alias explicito del contrato SQL idempotente de captura."""
    return capturar_pago_simulado(cod_transaccion)


def generar_reembolso_simulado(cod_devolucion):
    return ejecutar_funcion_scalar(
        "fn_generar_reembolso_simulado",
        [cod_devolucion],
        ["BIGINT"],
        usar_transaccion=True,
    )


def bloquear_metodo_pago_simulado(cod_metodo_pago, bloqueada=True):
    return ejecutar_funcion_void(
        "fn_bloquear_metodo_pago_simulado",
        [cod_metodo_pago, bloqueada],
        ["BIGINT", "BOOLEAN"],
    )


def ajustar_saldo_cuenta_simulada(cod_metodo_pago, nuevo_saldo):
    return ejecutar_funcion_void(
        "fn_ajustar_saldo_cuenta_simulada",
        [cod_metodo_pago, nuevo_saldo],
        ["BIGINT", "NUMERIC"],
    )


def desactivar_metodo_pago(cod_metodo_pago):
    return ejecutar_funcion_void(
        "fn_desactivar_metodo_pago",
        [cod_metodo_pago],
        ["BIGINT"],
    )


def luhn_valid(numero_tarjeta):
    return ejecutar_funcion_scalar(
        "fn_luhn_valid",
        [numero_tarjeta],
        ["TEXT"],
    )


def detectar_marca_tarjeta(numero_tarjeta):
    return ejecutar_funcion_scalar(
        "fn_detectar_marca_tarjeta",
        [numero_tarjeta],
        ["TEXT"],
    )


def cvv_longitud_por_marca(marca):
    return ejecutar_funcion_scalar(
        "fn_cvv_longitud_por_marca",
        [marca],
        ["TEXT"],
    )



def pagar_activar_membresia_simulada(cod_usuario, cod_plan, cod_metodo_pago, idempotency_key, renovacion_automatica=True):
    return ejecutar_funcion_scalar(
        "fn_pagar_activar_membresia_simulada",
        [cod_usuario, cod_plan, cod_metodo_pago, idempotency_key, renovacion_automatica],
        ["BIGINT", "BIGINT", "BIGINT", "TEXT", "BOOLEAN"],
        usar_transaccion=True,
    )
