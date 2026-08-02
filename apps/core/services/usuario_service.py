from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_void,
    ejecutar_funcion_tabla,
)


def usuario_tiene_permiso(cod_usuario, codigo_permiso):
    return ejecutar_funcion_scalar(
        "fn_usuario_tiene_permiso",
        [cod_usuario, codigo_permiso],
        ["BIGINT", "TEXT"],
    )


def asignar_rol_usuario(cod_usuario, nombre_rol):
    return ejecutar_funcion_void(
        "fn_asignar_rol_usuario",
        [cod_usuario, nombre_rol],
        ["BIGINT", "TEXT"],
    )


def quitar_rol_usuario(cod_usuario, nombre_rol):
    return ejecutar_funcion_void(
        "fn_quitar_rol_usuario",
        [cod_usuario, nombre_rol],
        ["BIGINT", "TEXT"],
    )


def registrar_intento_login(email, ip_origen, user_agent, exitoso, motivo=None):
    return ejecutar_funcion_scalar(
        "fn_registrar_intento_login",
        [email, ip_origen, user_agent, exitoso, motivo],
        ["TEXT", "INET", "TEXT", "BOOLEAN", "TEXT"],
        usar_transaccion=True,
    )


def verificar_email_usuario(cod_usuario):
    return ejecutar_funcion_void(
        "fn_verificar_email_usuario",
        [cod_usuario],
        ["BIGINT"],
    )


def cambiar_password_simulado(cod_usuario, password_hash):
    """
    Úsalo solo si quieres cambiar directamente el hash.
    Para login real de Django es mejor usar:
        usuario.set_password("clave")
        usuario.save(update_fields=["password"])
    """
    return ejecutar_funcion_void(
        "fn_cambiar_password_simulado",
        [cod_usuario, password_hash],
        ["BIGINT", "TEXT"],
    )


def obtener_usuario(cod_usuario):
    filas = ejecutar_funcion_tabla(
        "fn_obtener_usuario",
        [cod_usuario],
        ["BIGINT"],
    )
    return filas[0] if filas else None




def crear_usuario_cliente(email, password, nombres, apellidos, telefono=None, documento_identidad=None):
    return ejecutar_funcion_scalar(
        "fn_crear_usuario_cliente",
        [email, password, nombres, apellidos, telefono, documento_identidad],
        ["TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT"],
        usar_transaccion=True,
    )


def crear_direccion_usuario(
    cod_usuario,
    alias,
    receptor,
    linea1,
    linea2,
    ciudad,
    provincia,
    pais="Ecuador",
    codigo_postal=None,
    telefono_contacto=None,
    es_predeterminada=False,
):
    return ejecutar_funcion_scalar(
        "fn_crear_direccion_usuario",
        [
            cod_usuario,
            alias,
            receptor,
            linea1,
            linea2,
            ciudad,
            provincia,
            pais,
            codigo_postal,
            telefono_contacto,
            es_predeterminada,
        ],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "BOOLEAN"],
        usar_transaccion=True,
    )


def actualizar_direccion_usuario(
    cod_direccion,
    alias=None,
    receptor=None,
    linea1=None,
    linea2=None,
    ciudad=None,
    provincia=None,
    pais=None,
    codigo_postal=None,
    telefono_contacto=None,
    es_predeterminada=None,
):
    return ejecutar_funcion_void(
        "fn_actualizar_direccion_usuario",
        [
            cod_direccion,
            alias,
            receptor,
            linea1,
            linea2,
            ciudad,
            provincia,
            pais,
            codigo_postal,
            telefono_contacto,
            es_predeterminada,
        ],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "TEXT", "BOOLEAN"],
    )


def eliminar_direccion_usuario(cod_direccion):
    return ejecutar_funcion_void(
        "fn_eliminar_direccion_usuario",
        [cod_direccion],
        ["BIGINT"],
    )


def actualizar_usuario(cod_usuario, nombres, apellidos, telefono=None, email_verificado=False, activo=True):
    return ejecutar_funcion_void(
        "fn_actualizar_usuario",
        [cod_usuario, nombres, apellidos, telefono, email_verificado, activo],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "BOOLEAN", "BOOLEAN"],
    )


def desactivar_usuario(cod_usuario):
    return ejecutar_funcion_void("fn_eliminar_usuario_logico", [cod_usuario], ["BIGINT"])


def cambiar_password_usuario(cod_usuario, password):
    return ejecutar_funcion_void("fn_cambiar_password_usuario", [cod_usuario, password, 120000], ["BIGINT", "TEXT", "INTEGER"])
