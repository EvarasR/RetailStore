"""
Servicios base para ejecutar funciones PostgreSQL del proyecto Retail Prime.

Regla del proyecto:
- La lógica crítica vive en PostgreSQL.
- Django llama funciones SQL desde servicios, no directamente desde las vistas.
"""

import re
from django.db import connection, transaction


FUNCION_SQL_REGEX = re.compile(r"^fn_[a-zA-Z0-9_]+$")
TIPO_SQL_REGEX = re.compile(r"^[A-Z0-9_(),\s]+$")


def _validar_nombre_funcion(nombre_funcion: str) -> None:
    if not FUNCION_SQL_REGEX.match(nombre_funcion or ""):
        raise ValueError(f"Nombre de función SQL no permitido: {nombre_funcion!r}")


def _validar_tipos(tipos):
    if tipos is None:
        return

    for tipo in tipos:
        if tipo is None:
            continue

        tipo_normalizado = str(tipo).upper().strip()
        if not TIPO_SQL_REGEX.match(tipo_normalizado):
            raise ValueError(f"Tipo SQL no permitido: {tipo!r}")


def _armar_argumentos(parametros, tipos=None):
    parametros = list(parametros or [])

    if tipos is None:
        tipos = [None] * len(parametros)
    else:
        tipos = list(tipos)

    if len(tipos) != len(parametros):
        raise ValueError("La cantidad de tipos SQL debe coincidir con la cantidad de parámetros.")

    _validar_tipos(tipos)

    partes = []
    for tipo in tipos:
        if tipo:
            partes.append(f"%s::{str(tipo).upper().strip()}")
        else:
            partes.append("%s")

    return ", ".join(partes), parametros


def ejecutar_funcion_scalar(nombre_funcion, parametros=None, tipos=None, usar_transaccion=False):
    """
    Ejecuta una función SQL que retorna un solo valor.
    Ejemplo:
        SELECT fn_stock_disponible_producto(%s::BIGINT)
    """
    _validar_nombre_funcion(nombre_funcion)
    argumentos_sql, parametros = _armar_argumentos(parametros, tipos)

    sql = f"SELECT {nombre_funcion}({argumentos_sql})"

    def _ejecutar():
        with connection.cursor() as cursor:
            cursor.execute(sql, parametros)
            fila = cursor.fetchone()
        return fila[0] if fila else None

    if usar_transaccion:
        with transaction.atomic():
            return _ejecutar()

    return _ejecutar()


def ejecutar_funcion_void(nombre_funcion, parametros=None, tipos=None, usar_transaccion=True):
    """
    Ejecuta una función SQL tipo VOID.
    Devuelve True si no lanzó excepción.
    """
    ejecutar_funcion_scalar(
        nombre_funcion=nombre_funcion,
        parametros=parametros,
        tipos=tipos,
        usar_transaccion=usar_transaccion,
    )
    return True


def ejecutar_funcion_tabla(nombre_funcion, parametros=None, tipos=None, usar_transaccion=False):
    """
    Ejecuta una función SQL que retorna TABLE(...) o SETOF.
    Devuelve una lista de diccionarios.
    Ejemplo:
        SELECT * FROM fn_consultar_proveedores_para_faltante(%s::BIGINT, %s::INTEGER)
    """
    _validar_nombre_funcion(nombre_funcion)
    argumentos_sql, parametros = _armar_argumentos(parametros, tipos)

    sql = f"SELECT * FROM {nombre_funcion}({argumentos_sql})"

    def _ejecutar():
        with connection.cursor() as cursor:
            cursor.execute(sql, parametros)
            columnas = [col[0] for col in cursor.description]
            filas = cursor.fetchall()
        return [dict(zip(columnas, fila)) for fila in filas]

    if usar_transaccion:
        with transaction.atomic():
            return _ejecutar()

    return _ejecutar()


def ejecutar_consulta(sql, parametros=None):
    """
    Ejecuta SELECT personalizados.
    Usar solo con SQL interno, nunca con texto armado desde el usuario.
    """
    with connection.cursor() as cursor:
        cursor.execute(sql, parametros or [])
        columnas = [col[0] for col in cursor.description]
        filas = cursor.fetchall()

    return [dict(zip(columnas, fila)) for fila in filas]


# Alias para compatibilidad con servicios anteriores.
def ejecutar_funcion(nombre_funcion, parametros=None):
    return ejecutar_funcion_scalar(nombre_funcion, parametros)


def ejecutar_funcion_transaccional(nombre_funcion, parametros=None):
    return ejecutar_funcion_scalar(nombre_funcion, parametros, usar_transaccion=True)
