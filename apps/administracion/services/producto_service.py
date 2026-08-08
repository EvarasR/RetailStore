import json

from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
    ejecutar_funcion_tabla,
    ejecutar_funcion_void,
)


def stock_disponible_producto(cod_producto):
    """
    Función real en PostgreSQL:
        fn_stock_disponible_producto(p_cod_producto BIGINT)
    """
    return ejecutar_funcion_scalar(
        "fn_stock_disponible_producto",
        [cod_producto],
        ["BIGINT"],
    )


# Alias más cómodo para usar en vistas.
def calcular_stock_disponible(cod_producto):
    return stock_disponible_producto(cod_producto)


def stock_proveedor_disponible_producto(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_stock_proveedor_disponible_producto",
        [cod_producto],
        ["BIGINT"],
    )


def contar_proveedores_activos_producto(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_contar_proveedores_activos_producto",
        [cod_producto],
        ["BIGINT"],
    )


def producto_tiene_imagen_principal(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_producto_tiene_imagen_principal",
        [cod_producto],
        ["BIGINT"],
    )


def validar_producto_publicable(cod_producto):
    return ejecutar_funcion_void(
        "fn_validar_producto_publicable",
        [cod_producto],
        ["BIGINT"],
    )


def publicar_producto(cod_producto):
    return ejecutar_funcion_void(
        "fn_publicar_producto",
        [cod_producto],
        ["BIGINT"],
    )


def pausar_producto(cod_producto):
    return ejecutar_funcion_void(
        "fn_pausar_producto",
        [cod_producto],
        ["BIGINT"],
    )


def desactivar_producto(cod_producto):
    return ejecutar_funcion_void(
        "fn_desactivar_producto",
        [cod_producto],
        ["BIGINT"],
    )


def crear_categoria(nombre, slug, descripcion=None, cod_categoria_padre=None):
    return ejecutar_funcion_scalar(
        "fn_crear_categoria",
        [nombre, slug, descripcion, cod_categoria_padre],
        ["TEXT", "TEXT", "TEXT", "BIGINT"],
        usar_transaccion=True,
    )


def actualizar_categoria(cod_categoria, nombre=None, slug=None, descripcion=None, activo=None):
    return ejecutar_funcion_void(
        "fn_actualizar_categoria",
        [cod_categoria, nombre, slug, descripcion, activo],
        ["BIGINT", "TEXT", "TEXT", "TEXT", "BOOLEAN"],
    )


def eliminar_categoria_logica(cod_categoria):
    return ejecutar_funcion_void(
        "fn_eliminar_categoria_logica",
        [cod_categoria],
        ["BIGINT"],
    )


def crear_marca(nombre, descripcion=None):
    return ejecutar_funcion_scalar(
        "fn_crear_marca",
        [nombre, descripcion],
        ["TEXT", "TEXT"],
        usar_transaccion=True,
    )


def actualizar_marca(cod_marca, nombre=None, descripcion=None, activo=None):
    return ejecutar_funcion_void(
        "fn_actualizar_marca",
        [cod_marca, nombre, descripcion, activo],
        ["BIGINT", "TEXT", "TEXT", "BOOLEAN"],
    )


def eliminar_marca_logica(cod_marca):
    return ejecutar_funcion_void(
        "fn_eliminar_marca_logica",
        [cod_marca],
        ["BIGINT"],
    )


def crear_producto(
    cod_categoria,
    cod_marca,
    sku,
    nombre,
    descripcion,
    precio_actual,
    peso_kg=0,
    largo_cm=0,
    ancho_cm=0,
    alto_cm=0,
    metadata=None,
):
    metadata_json = json.dumps(metadata or {})

    return ejecutar_funcion_scalar(
        "fn_crear_producto",
        [
            cod_categoria,
            cod_marca,
            sku,
            nombre,
            descripcion,
            precio_actual,
            peso_kg,
            largo_cm,
            ancho_cm,
            alto_cm,
            metadata_json,
        ],
        ["BIGINT", "BIGINT", "TEXT", "TEXT", "TEXT", "NUMERIC", "NUMERIC", "NUMERIC", "NUMERIC", "NUMERIC", "JSONB"],
        usar_transaccion=True,
    )


def actualizar_producto(
    cod_producto,
    nombre=None,
    descripcion=None,
    precio_actual=None,
    cod_categoria=None,
    cod_marca=None,
    metadata=None,
):
    metadata_json = json.dumps(metadata) if metadata is not None else None

    return ejecutar_funcion_void(
        "fn_actualizar_producto",
        [cod_producto, nombre, descripcion, precio_actual, cod_categoria, cod_marca, metadata_json],
        ["BIGINT", "TEXT", "TEXT", "NUMERIC", "BIGINT", "BIGINT", "JSONB"],
    )


def agregar_imagen_producto(
    cod_producto,
    url_imagen,
    alt_text=None,
    es_principal=False,
    orden=1,
):
    return ejecutar_funcion_scalar(
        "fn_agregar_imagen_producto",
        [cod_producto, url_imagen, alt_text, es_principal, orden],
        ["BIGINT", "TEXT", "TEXT", "BOOLEAN", "INTEGER"],
        usar_transaccion=True,
    )


def actualizar_imagen_producto(cod_imagen, url_imagen, alt_text=None, orden=1, activo=True):
    return ejecutar_funcion_void(
        "fn_actualizar_imagen_producto",
        [cod_imagen, url_imagen, alt_text, orden, activo],
        ["BIGINT", "TEXT", "TEXT", "INTEGER", "BOOLEAN"],
        usar_transaccion=True,
    )


def desactivar_imagen_producto(cod_imagen):
    return ejecutar_funcion_void("fn_desactivar_imagen_producto", [cod_imagen], ["BIGINT"], usar_transaccion=True)


def ordenar_imagen_producto(cod_imagen, orden, es_principal=False):
    return ejecutar_funcion_void(
        "fn_ordenar_imagen_producto", [cod_imagen, orden, es_principal], ["BIGINT", "INTEGER", "BOOLEAN"], usar_transaccion=True
    )


def crear_producto_atributo(nombre, tipo_dato="TEXT"):
    return ejecutar_funcion_scalar("fn_crear_producto_atributo", [nombre, tipo_dato], ["TEXT", "VARCHAR"], usar_transaccion=True)


def actualizar_producto_atributo(cod_atributo, nombre, tipo_dato, activo=True):
    return ejecutar_funcion_void(
        "fn_actualizar_producto_atributo", [cod_atributo, nombre, tipo_dato, activo], ["BIGINT", "TEXT", "VARCHAR", "BOOLEAN"], usar_transaccion=True
    )


def desactivar_producto_atributo(cod_atributo):
    return ejecutar_funcion_void("fn_desactivar_producto_atributo", [cod_atributo], ["BIGINT"], usar_transaccion=True)


def asignar_producto_atributo_valor(cod_producto, cod_atributo, valor):
    return ejecutar_funcion_void(
        "fn_asignar_producto_atributo_valor", [cod_producto, cod_atributo, valor], ["BIGINT", "BIGINT", "TEXT"], usar_transaccion=True
    )


def desasociar_producto_atributo_valor(cod_producto, cod_atributo):
    return ejecutar_funcion_void(
        "fn_desasociar_producto_atributo_valor", [cod_producto, cod_atributo], ["BIGINT", "BIGINT"], usar_transaccion=True
    )


def precio_producto_con_promocion(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_precio_producto_con_promocion",
        [cod_producto],
        ["BIGINT"],
    )


def detalle_precio_producto(cod_producto):
    resultado = ejecutar_funcion_scalar(
        "fn_detalle_precio_producto",
        [cod_producto],
        ["BIGINT"],
    )
    if isinstance(resultado, str):
        return json.loads(resultado)
    return resultado or {}


def recalcular_precio_desde_producto(cod_producto):
    """Actualiza en PostgreSQL el precio de exhibicion desde el lote FIFO."""
    return ejecutar_funcion_void(
        "fn_recalcular_precio_actual_producto", [cod_producto], ["BIGINT"], usar_transaccion=True
    )


def obtener_regla_precio_producto(cod_producto, fecha_referencia=None):
    return ejecutar_funcion_tabla(
        "fn_obtener_regla_precio_producto",
        [cod_producto, fecha_referencia],
        ["BIGINT", "TIMESTAMPTZ"],
    )


def calcular_pvp_lote(cod_producto, costo_unitario, fecha_referencia=None):
    return ejecutar_funcion_scalar(
        "fn_calcular_pvp_lote",
        [cod_producto, costo_unitario, fecha_referencia],
        ["BIGINT", "NUMERIC", "TIMESTAMPTZ"],
    )


def crear_regla_precio(
    cod_producto,
    cod_categoria,
    margen_porcentaje,
    costo_operativo_porcentaje=0,
    costo_fijo_unitario=0,
    porcentaje_impuesto=None,
    prioridad=100,
):
    return ejecutar_funcion_scalar(
        "fn_crear_regla_precio",
        [
            cod_producto, cod_categoria, margen_porcentaje,
            costo_operativo_porcentaje, costo_fijo_unitario,
            porcentaje_impuesto, prioridad,
        ],
        ["BIGINT", "BIGINT", "NUMERIC", "NUMERIC", "NUMERIC", "NUMERIC", "INTEGER"],
        usar_transaccion=True,
    )


def actualizar_regla_precio(
    cod_regla_precio,
    margen_porcentaje,
    costo_operativo_porcentaje,
    costo_fijo_unitario,
    porcentaje_impuesto,
    prioridad,
    activo,
):
    return ejecutar_funcion_void(
        "fn_actualizar_regla_precio",
        [
            cod_regla_precio, margen_porcentaje, costo_operativo_porcentaje,
            costo_fijo_unitario, porcentaje_impuesto, prioridad, activo,
        ],
        ["BIGINT", "NUMERIC", "NUMERIC", "NUMERIC", "NUMERIC", "INTEGER", "BOOLEAN"],
        usar_transaccion=True,
    )


def desactivar_regla_precio(cod_regla_precio):
    return ejecutar_funcion_void(
        "fn_desactivar_regla_precio", [cod_regla_precio], ["BIGINT"], usar_transaccion=True
    )


def registrar_busqueda(cod_usuario, termino, resultados=0):
    return ejecutar_funcion_scalar(
        "fn_registrar_busqueda",
        [cod_usuario, termino, resultados],
        ["BIGINT", "TEXT", "INTEGER"],
        usar_transaccion=True,
    )


def registrar_producto_visto(cod_usuario, cod_producto):
    return ejecutar_funcion_scalar(
        "fn_registrar_producto_visto",
        [cod_usuario, cod_producto],
        ["BIGINT", "BIGINT"],
        usar_transaccion=True,
    )
