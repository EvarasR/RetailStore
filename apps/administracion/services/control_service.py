"""Operaciones del centro de control que preservan reglas y trazabilidad SQL."""

from apps.core.services.sql_service import ejecutar_funcion_scalar, ejecutar_funcion_void


def _void(nombre, parametros, tipos):
    return ejecutar_funcion_void(nombre, parametros, tipos)


def configurar_archivo_producto(cod_producto, tipo, url, titulo=None, eliminar=False):
    return _void("fn_configurar_archivo_producto", [cod_producto, tipo, url, titulo, eliminar], ["BIGINT", "VARCHAR", "TEXT", "TEXT", "BOOLEAN"])


def actualizar_producto_completo(cod_producto, cod_categoria, cod_marca, sku, nombre, descripcion, precio, peso, largo, ancho, alto):
    return _void(
        "fn_actualizar_producto_completo",
        [cod_producto, cod_categoria, cod_marca, sku, nombre, descripcion, precio, peso, largo, ancho, alto],
        ["BIGINT", "BIGINT", "BIGINT", "TEXT", "TEXT", "TEXT", "NUMERIC", "NUMERIC", "NUMERIC", "NUMERIC", "NUMERIC"],
    )


def configurar_limite_producto(cod_producto, por_pedido, por_dia=None, por_mes=None, revision=False, activo=True):
    return ejecutar_funcion_scalar("fn_configurar_limite_producto", [cod_producto, por_pedido, por_dia, por_mes, revision, activo], ["BIGINT", "INTEGER", "INTEGER", "INTEGER", "BOOLEAN", "BOOLEAN"], usar_transaccion=True)


def asociar_producto_relacionado(cod_producto, cod_relacionado, tipo="RELACIONADO"):
    return _void("fn_asociar_producto_relacionado", [cod_producto, cod_relacionado, tipo], ["BIGINT", "BIGINT", "VARCHAR"])


def desasociar_producto_relacionado(cod_producto, cod_relacionado):
    return _void("fn_desasociar_producto_relacionado", [cod_producto, cod_relacionado], ["BIGINT", "BIGINT"])


def moderar_resena(cod_resena, aprobado):
    return _void("fn_moderar_resena_producto", [cod_resena, aprobado], ["BIGINT", "BOOLEAN"])


def moderar_pregunta(cod_pregunta, estado):
    return _void("fn_moderar_pregunta_producto", [cod_pregunta, estado], ["BIGINT", "VARCHAR"])


def responder_pregunta(cod_pregunta, cod_usuario, respuesta):
    return ejecutar_funcion_scalar("fn_responder_pregunta_producto", [cod_pregunta, cod_usuario, respuesta], ["BIGINT", "BIGINT", "TEXT"], usar_transaccion=True)


def desasociar_promocion_producto(cod_promocion, cod_producto):
    return _void("fn_desasociar_promocion_producto", [cod_promocion, cod_producto], ["BIGINT", "BIGINT"])


def actualizar_plan(cod_plan, nombre, precio, duracion, activo=True):
    return _void("fn_actualizar_plan_membresia", [cod_plan, nombre, precio, duracion, activo], ["BIGINT", "TEXT", "NUMERIC", "INTEGER", "BOOLEAN"])


def cancelar_membresia(cod_membresia):
    return _void("fn_cancelar_membresia_usuario", [cod_membresia], ["BIGINT"])


def crear_rol(nombre, descripcion=None):
    return ejecutar_funcion_scalar("fn_crear_rol", [nombre, descripcion], ["TEXT", "TEXT"], usar_transaccion=True)


def actualizar_rol(cod_rol, nombre, descripcion=None, activo=True):
    return _void("fn_actualizar_rol", [cod_rol, nombre, descripcion, activo], ["BIGINT", "TEXT", "TEXT", "BOOLEAN"])


def crear_permiso(codigo, nombre, descripcion=None):
    return ejecutar_funcion_scalar("fn_crear_permiso", [codigo, nombre, descripcion], ["TEXT", "TEXT", "TEXT"], usar_transaccion=True)


def actualizar_permiso(cod_permiso, codigo, nombre, descripcion=None, activo=True):
    return _void("fn_actualizar_permiso", [cod_permiso, codigo, nombre, descripcion, activo], ["BIGINT", "TEXT", "TEXT", "TEXT", "BOOLEAN"])


def asignar_permiso_rol(cod_rol, cod_permiso):
    return _void("fn_asignar_permiso_rol", [cod_rol, cod_permiso], ["BIGINT", "BIGINT"])


def revocar_permiso_rol(cod_rol, cod_permiso):
    return _void("fn_revocar_permiso_rol", [cod_rol, cod_permiso], ["BIGINT", "BIGINT"])


def reactivar_usuario(cod_usuario):
    return _void("fn_reactivar_usuario", [cod_usuario], ["BIGINT"])


def actualizar_almacen(cod_almacen, nombre, direccion, ciudad, provincia, activo=True):
    return _void("fn_actualizar_almacen", [cod_almacen, nombre, direccion, ciudad, provincia, activo], ["BIGINT", "TEXT", "TEXT", "TEXT", "TEXT", "BOOLEAN"])


def desactivar_almacen(cod_almacen):
    return _void("fn_desactivar_almacen", [cod_almacen], ["BIGINT"])


def actualizar_estado_lote(cod_lote, estado):
    return _void("fn_actualizar_estado_lote", [cod_lote, estado], ["BIGINT", "VARCHAR"])


def crear_transportista(nombre, telefono=None, email=None):
    return ejecutar_funcion_scalar("fn_crear_transportista", [nombre, telefono, email], ["TEXT", "TEXT", "TEXT"], usar_transaccion=True)


def actualizar_transportista(cod, nombre, telefono=None, email=None, activo=True):
    return _void("fn_actualizar_transportista", [cod, nombre, telefono, email, activo], ["BIGINT", "TEXT", "TEXT", "TEXT", "BOOLEAN"])


def crear_metodo_envio(nombre, dias_min, dias_max, costo, prime=False):
    return ejecutar_funcion_scalar("fn_crear_metodo_envio", [nombre, dias_min, dias_max, costo, prime], ["TEXT", "INTEGER", "INTEGER", "NUMERIC", "BOOLEAN"], usar_transaccion=True)


def actualizar_metodo_envio(cod, nombre, dias_min, dias_max, costo, prime=False, activo=True):
    return _void("fn_actualizar_metodo_envio", [cod, nombre, dias_min, dias_max, costo, prime, activo], ["BIGINT", "TEXT", "INTEGER", "INTEGER", "NUMERIC", "BOOLEAN", "BOOLEAN"])


def crear_zona(ciudad, provincia, recargo=0):
    return ejecutar_funcion_scalar("fn_crear_zona_entrega", [ciudad, provincia, recargo], ["TEXT", "TEXT", "NUMERIC"], usar_transaccion=True)


def actualizar_zona(cod, ciudad, provincia, recargo=0, activo=True):
    return _void("fn_actualizar_zona_entrega", [cod, ciudad, provincia, recargo, activo], ["BIGINT", "TEXT", "TEXT", "NUMERIC", "BOOLEAN"])


def actualizar_estado_ticket(cod_ticket, estado):
    return _void("fn_actualizar_estado_ticket_soporte", [cod_ticket, estado], ["BIGINT", "VARCHAR"])


def actualizar_compra_recurrente(cod_compra, nombre, frecuencia, proxima, activa=True):
    return _void("fn_actualizar_compra_recurrente", [cod_compra, nombre, frecuencia, proxima, activa], ["BIGINT", "TEXT", "INTEGER", "DATE", "BOOLEAN"])
