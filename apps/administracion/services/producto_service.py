import json

from apps.core.services.sql_service import (
    ejecutar_funcion_scalar,
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


def precio_producto_con_promocion(cod_producto):
    return ejecutar_funcion_scalar(
        "fn_precio_producto_con_promocion",
        [cod_producto],
        ["BIGINT"],
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
