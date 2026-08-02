from decimal import Decimal
from urllib.parse import urlparse

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.db.models import Count, Sum
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from apps.administracion.models import (
    AlertaStock,
    Categoria,
    Inventario,
    Producto,
    ProductoImagen,
    ResumenVentaDiaria,
    SnapshotKpi,
)
from apps.administracion.services.producto_service import (
    actualizar_categoria,
    actualizar_marca,
    agregar_imagen_producto,
    actualizar_imagen_producto,
    desactivar_imagen_producto,
    ordenar_imagen_producto,
    crear_categoria,
    crear_marca,
    crear_producto,
    actualizar_producto,
    crear_regla_precio,
    crear_producto_atributo,
    actualizar_producto_atributo,
    desactivar_producto_atributo,
    asignar_producto_atributo_valor,
    desasociar_producto_atributo_valor,
    actualizar_regla_precio,
    desactivar_regla_precio,
    desactivar_producto,
    eliminar_categoria_logica,
    eliminar_marca_logica,
    pausar_producto,
    publicar_producto,
    recalcular_precio_desde_producto,
    stock_disponible_producto,
    validar_producto_publicable,
)
from apps.administracion.services.inventario_service import (
    crear_lote_inventario,
    generar_reposicion_automatica,
    recalcular_inventario_desde_lotes,
    resolver_alerta_stock,
)
from apps.administracion.services.promocion_service import (
    actualizar_cupon,
    actualizar_promocion,
    asociar_promocion_producto,
    crear_cupon,
    crear_promocion,
    desactivar_cupon,
    desactivar_promocion,
)
from apps.administracion.services import panel_service
from apps.clientes.models import Carrito
from apps.clientes.services.membresia_service import (
    actualizar_beneficio_membresia,
    crear_beneficio_membresia,
    desactivar_beneficio_membresia,
)
from apps.core.models import EstadoPedido, Usuario
from apps.operaciones.models import Pedido
from apps.operaciones.services.tracking_service import (
    actualizar_envio_estado,
    procesar_tracking_pendiente,
)
from apps.proveedores.models import Proveedor
from apps.proveedores.services.proveedor_service import (
    actualizar_proveedor,
    asociar_producto_proveedor,
    cancelar_orden_abastecimiento,
    crear_contacto_proveedor,
    crear_proveedor,
    asociar_usuario_proveedor,
    desasociar_usuario_proveedor,
    desasociar_producto_proveedor,
    eliminar_proveedor_logico,
    recibir_orden_abastecimiento,
)
from apps.clientes.services.checkout_service import actualizar_estado_pedido


def _json_ok(**data):
    payload = {"ok": True}
    payload.update(data)
    return JsonResponse(payload)


def _json_error(mensaje, status=400):
    return JsonResponse({"ok": False, "mensaje": mensaje}, status=status)


def _safe_error(exc, mensaje="No se pudo completar la operación."):
    return str(exc) if settings.DEBUG else mensaje


def _money(value):
    if value is None:
        return "0.00"
    if isinstance(value, Decimal):
        return f"{value:.2f}"
    return str(value)


def _dt(value):
    return value.isoformat() if value else None


def _post_int(request, key, required=True):
    value = request.POST.get(key)
    if value in (None, ""):
        if required:
            raise ValueError(f"El campo {key} es obligatorio.")
        return None
    return int(value)


def _post_decimal(request, key, required=True):
    value = request.POST.get(key)
    if value in (None, ""):
        if required:
            raise ValueError(f"El campo {key} es obligatorio.")
        return None
    return Decimal(value)


def _post_bool(request, key, default=False):
    value = request.POST.get(key)
    if value is None:
        return default
    return str(value).strip().lower() in {"1", "true", "si", "sí", "on"}


def _validar_url_imagen(url):
    url = (url or "").strip()
    parsed = urlparse(url)
    if len(url) > 2048 or parsed.scheme not in ("http", "https"):
        raise ValueError("La imagen debe usar una URL HTTP(S) válida.")
    if not parsed.netloc:
        raise ValueError("La URL de imagen no contiene host.")
    return url


def _es_admin(user):
    return user.is_authenticated and getattr(user, "is_staff", False)


def _exigir_admin(request):
    if not _es_admin(request.user):
        return _json_error("No tienes permisos para esta operación.", status=403)
    return None


def _imagen_producto(cod_producto):
    img = ProductoImagen.objects.filter(cod_producto_id=cod_producto, es_principal=True).first()
    if not img:
        img = ProductoImagen.objects.filter(cod_producto_id=cod_producto).order_by("orden").first()
    return img.url_imagen if img else ""


@login_required(login_url="/login/")
@ensure_csrf_cookie
def panel_view(request):
    if not _es_admin(request.user):
        return redirect("clientes:inicio")
    return render(request, "administracion/panel.html", {"sin_permiso": False})


@login_required(login_url="/login/")
@require_GET
def api_resumen(request):
    error = _exigir_admin(request)
    if error:
        return error

    resumen = panel_service.resumen_panel()
    tarjetas = resumen["tarjetas"]
    estados = resumen["estados_pedido"]
    ventas_dias = resumen["ventas_diarias"]
    kpis = resumen["kpis"]

    return _json_ok(
        tarjetas={
            "productos": tarjetas["productos"],
            "productos_publicados": tarjetas["productos_publicados"],
            "pedidos": tarjetas["pedidos"],
            "ventas": _money(tarjetas["ventas"]),
            "clientes": tarjetas["clientes"],
            "proveedores": tarjetas["proveedores"],
            "alertas_stock": tarjetas["alertas_stock"],
            "carritos_activos": Carrito.objects.filter(estado="ACTIVO").count(),
        },
        estados_pedido=[{"estado": e["cod_estado_pedido_id"], "total": e["total"]} for e in estados],
        ventas_diarias=[
            {
                "fecha": v.fecha.isoformat(),
                "total_pedidos": v.total_pedidos,
                "total_ventas": _money(v.total_ventas),
                "ticket_promedio": _money(v.ticket_promedio),
            }
            for v in reversed(list(ventas_dias))
        ],
        kpis=[
            {
                "nombre": k.nombre_kpi,
                "valor": _money(k.valor),
                "unidad": k.unidad,
                "fecha": _dt(k.fecha_snapshot),
            }
            for k in kpis
        ],
    )


@login_required(login_url="/login/")
@require_GET
def api_productos_admin(request):
    error = _exigir_admin(request)
    if error:
        return error

    q = (request.GET.get("q") or "").strip()
    estado = request.GET.get("estado") or ""
    qs = Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto").order_by("-fecha_creacion")
    if q:
        qs = qs.filter(nombre__icontains=q)
    if estado:
        qs = qs.filter(cod_estado_producto_id=estado)
    qs = qs[:80]

    productos = []
    for p in qs:
        try:
            stock = stock_disponible_producto(p.cod_producto)
        except Exception:
            stock = None
        productos.append({
            "cod_producto": p.cod_producto,
            "sku": p.sku,
            "nombre": p.nombre,
            "categoria": p.cod_categoria.nombre,
            "marca": p.cod_marca.nombre,
            "precio": _money(p.precio_actual),
            "estado": p.cod_estado_producto_id,
            "stock": stock,
            "imagen": _imagen_producto(p.cod_producto),
            "fecha": _dt(p.fecha_creacion),
        })

    return _json_ok(productos=productos)


@login_required(login_url="/login/")
@require_POST
def api_publicar_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        publicar_producto(cod_producto)
        return _json_ok(mensaje="Producto publicado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_pausar_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        pausar_producto(cod_producto)
        return _json_ok(mensaje="Producto pausado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_desactivar_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        desactivar_producto(cod_producto)
        return _json_ok(mensaje="Producto desactivado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_inventario(request):
    error = _exigir_admin(request)
    if error:
        return error

    inventario = panel_service.listar_inventario()
    return _json_ok(
        inventario=[
            {
                "cod_producto": i.cod_producto.cod_producto,
                "producto": i.cod_producto.nombre,
                "almacen": i.cod_almacen.nombre,
                "stock_total": i.stock_total,
                "stock_reservado": i.stock_reservado,
                "stock_disponible": i.stock_total - i.stock_reservado,
                "stock_minimo": i.stock_minimo,
                "fecha_actualizacion": _dt(i.fecha_actualizacion),
            }
            for i in inventario
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_pedidos_admin(request):
    error = _exigir_admin(request)
    if error:
        return error

    estado = request.GET.get("estado") or ""
    qs = Pedido.objects.select_related("cod_usuario", "cod_estado_pedido").order_by("-fecha_creacion")
    if estado:
        qs = qs.filter(cod_estado_pedido_id=estado)
    qs = qs[:80]

    estados = EstadoPedido.objects.order_by("orden")
    return _json_ok(
        estados=[{"cod_estado_pedido": e.cod_estado_pedido, "nombre": e.nombre} for e in estados],
        pedidos=[
            {
                "cod_pedido": p.cod_pedido,
                "numero_pedido": p.numero_pedido,
                "cliente": p.cod_usuario.get_full_name() or p.cod_usuario.email,
                "email": p.cod_usuario.email,
                "estado": p.cod_estado_pedido_id,
                "estado_nombre": p.cod_estado_pedido.nombre,
                "total": _money(p.total),
                "fecha": _dt(p.fecha_creacion),
                "requiere_abastecimiento": p.requiere_abastecimiento,
            }
            for p in qs
        ],
    )


@login_required(login_url="/login/")
@require_POST
def api_cambiar_estado_pedido(request, cod_pedido):
    error = _exigir_admin(request)
    if error:
        return error

    estado = request.POST.get("estado") or ""
    comentario = request.POST.get("comentario") or "Cambio desde panel administrativo"
    try:
        actualizar_estado_pedido(cod_pedido, estado, comentario)
        return _json_ok(mensaje="Estado actualizado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_proveedores_admin(request):
    error = _exigir_admin(request)
    if error:
        return error

    proveedores = Proveedor.objects.order_by("razon_social")[:100]
    return _json_ok(
        proveedores=[
            {
                "cod_proveedor": p.cod_proveedor,
                "ruc": p.ruc,
                "razon_social": p.razon_social,
                "nombre_comercial": p.nombre_comercial,
                "email": p.email,
                "telefono": p.telefono,
                "ciudad": p.ciudad,
                "provincia": p.provincia,
                "calificacion": _money(p.calificacion),
                "activo": p.activo,
            }
            for p in proveedores
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_reporte_ventas(request):
    error = _exigir_admin(request)
    if error:
        return error

    ventas = ResumenVentaDiaria.objects.order_by("-fecha")[:30]
    return _json_ok(
        ventas=[
            {
                "fecha": v.fecha.isoformat(),
                "total_pedidos": v.total_pedidos,
                "total_clientes": v.total_clientes,
                "total_ventas": _money(v.total_ventas),
                "ticket_promedio": _money(v.ticket_promedio),
            }
            for v in reversed(list(ventas))
        ]
    )


# APIs ampliadas de Fase H. Las vistas validan HTTP/permisos; los cambios se
# delegan a services, que invocan las funciones SQL del esquema public.
@login_required(login_url="/login/")
@require_GET
def api_catalogo_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    entidad = request.GET.get("entidad", "producto")
    try:
        return _json_ok(entidad=entidad, registros=panel_service.listar_entidad(entidad, request.GET.get("activos", "1") != "0"))
    except Exception as exc:
        return _json_error(_safe_error(exc), status=400)


@login_required(login_url="/login/")
@require_POST
def api_categoria_admin(request, cod_categoria=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_categoria is None:
            ident = crear_categoria(request.POST["nombre"], request.POST["slug"], request.POST.get("descripcion") or None, _post_int(request, "cod_categoria_padre", False))
            return _json_ok(cod_categoria=ident, mensaje="Categoría creada.")
        if _post_bool(request, "desactivar"):
            eliminar_categoria_logica(cod_categoria)
        else:
            actualizar_categoria(cod_categoria, request.POST.get("nombre") or None, request.POST.get("slug") or None, request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Categoría actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_marca_admin(request, cod_marca=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_marca is None:
            return _json_ok(cod_marca=crear_marca(request.POST["nombre"], request.POST.get("descripcion") or None), mensaje="Marca creada.")
        if _post_bool(request, "desactivar"):
            eliminar_marca_logica(cod_marca)
        else:
            actualizar_marca(cod_marca, request.POST.get("nombre") or None, request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Marca actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_producto_admin(request, cod_producto=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_producto is None:
            ident = crear_producto(_post_int(request, "cod_categoria"), _post_int(request, "cod_marca"), request.POST["sku"], request.POST["nombre"], request.POST.get("descripcion", ""), _post_decimal(request, "precio_actual"), _post_decimal(request, "peso_kg", False) or 0, _post_decimal(request, "largo_cm", False) or 0, _post_decimal(request, "ancho_cm", False) or 0, _post_decimal(request, "alto_cm", False) or 0)
            return _json_ok(cod_producto=ident, mensaje="Producto creado.")
        actualizar_producto(cod_producto, request.POST.get("nombre") or None, request.POST.get("descripcion") or None, _post_decimal(request, "precio_actual", False), _post_int(request, "cod_categoria", False), _post_int(request, "cod_marca", False))
        return _json_ok(mensaje="Producto actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_validar_producto_publicable(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        validar_producto_publicable(cod_producto)
        return _json_ok(publicable=True, mensaje="El producto cumple las reglas de publicación.")
    except Exception as exc:
        return _json_ok(publicable=False, mensaje=_safe_error(exc))


@login_required(login_url="/login/")
@require_POST
def api_imagen_producto_admin(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        ident = agregar_imagen_producto(cod_producto, _validar_url_imagen(request.POST["url_imagen"]), request.POST.get("alt_text") or None, _post_bool(request, "es_principal"), _post_int(request, "orden", False) or 1)
        return _json_ok(cod_imagen=ident, mensaje="Imagen registrada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_imagen_admin(request, cod_imagen):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        accion = request.POST.get("accion")
        if accion == "desactivar":
            desactivar_imagen_producto(cod_imagen)
        elif accion == "ordenar":
            ordenar_imagen_producto(cod_imagen, _post_int(request, "orden"), _post_bool(request, "es_principal"))
        elif accion == "actualizar":
            actualizar_imagen_producto(cod_imagen, _validar_url_imagen(request.POST["url_imagen"]), request.POST.get("alt_text") or None, _post_int(request, "orden"), _post_bool(request, "activo", True))
        else:
            return _json_error("Acción de imagen no soportada.")
        return _json_ok(mensaje="Imagen actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_atributo_producto_admin(request, cod_atributo=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_atributo is None:
            ident = crear_producto_atributo(request.POST["nombre"], request.POST.get("tipo_dato") or "TEXT")
            return _json_ok(cod_atributo=ident, mensaje="Atributo técnico creado.")
        if _post_bool(request, "desactivar"):
            desactivar_producto_atributo(cod_atributo)
        else:
            actualizar_producto_atributo(cod_atributo, request.POST["nombre"], request.POST.get("tipo_dato") or "TEXT", _post_bool(request, "activo", True))
        return _json_ok(mensaje="Atributo técnico actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_valor_atributo_producto_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        producto, atributo = _post_int(request, "cod_producto"), _post_int(request, "cod_atributo")
        if _post_bool(request, "desasociar"):
            desasociar_producto_atributo_valor(producto, atributo)
        else:
            valor = (request.POST.get("valor") or "").strip()
            if not valor:
                return _json_error("El valor técnico es obligatorio.")
            asignar_producto_atributo_valor(producto, atributo, valor)
        return _json_ok(mensaje="Valor técnico actualizado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_beneficio_prime_admin(request, cod_beneficio=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_beneficio is None:
            ident = crear_beneficio_membresia(_post_int(request, "cod_plan"), request.POST["codigo"], request.POST["nombre"], _post_decimal(request, "valor", False), request.POST.get("descripcion") or None)
            return _json_ok(cod_beneficio=ident, mensaje="Beneficio Prime creado.")
        if _post_bool(request, "desactivar"):
            desactivar_beneficio_membresia(cod_beneficio)
        else:
            actualizar_beneficio_membresia(cod_beneficio, request.POST["nombre"], _post_decimal(request, "valor", False), request.POST.get("descripcion") or None, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Beneficio Prime actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_regla_precio_admin(request, cod_regla_precio=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_regla_precio is None:
            ident = crear_regla_precio(_post_int(request, "cod_producto", False), _post_int(request, "cod_categoria", False), _post_decimal(request, "margen_porcentaje"), _post_decimal(request, "costo_operativo_porcentaje", False) or 0, _post_decimal(request, "costo_fijo_unitario", False) or 0, _post_decimal(request, "porcentaje_impuesto", False), _post_int(request, "prioridad", False) or 100)
            return _json_ok(cod_regla_precio=ident, mensaje="Regla de precio creada.")
        if _post_bool(request, "desactivar"):
            desactivar_regla_precio(cod_regla_precio)
        else:
            actualizar_regla_precio(cod_regla_precio, _post_decimal(request, "margen_porcentaje"), _post_decimal(request, "costo_operativo_porcentaje", False) or 0, _post_decimal(request, "costo_fijo_unitario", False) or 0, _post_decimal(request, "porcentaje_impuesto", False), _post_int(request, "prioridad", False) or 100, _post_bool(request, "activo", True))
        return _json_ok(mensaje="Regla de precio actualizada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_recalcular_precio_producto(request, cod_producto):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        recalcular_precio_desde_producto(cod_producto)
        return _json_ok(mensaje="Precio de exhibición recalculado desde el lote FIFO.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_lotes_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    return _json_ok(lotes=[{"cod_lote": l.cod_lote, "numero_lote": l.numero_lote, "producto": l.cod_producto.nombre, "almacen": l.cod_almacen.nombre, "proveedor": l.cod_proveedor.razon_social if l.cod_proveedor else None, "disponible": l.cantidad_disponible, "reservada": l.cantidad_reservada, "costo": _money(l.costo_unitario), "pvp": _money(l.pvp_unitario), "estado": l.estado, "fecha_recepcion": _dt(l.fecha_recepcion)} for l in panel_service.listar_lotes()])


@login_required(login_url="/login/")
@require_POST
def api_lote_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        ident = crear_lote_inventario(_post_int(request, "cod_producto"), _post_int(request, "cod_almacen"), _post_int(request, "cantidad_recibida"), _post_decimal(request, "costo_unitario"), request.POST.get("numero_lote") or None, _post_int(request, "cod_proveedor", False), _post_int(request, "cod_orden_abastecimiento_detalle", False))
        return _json_ok(cod_lote=ident, mensaje="Lote creado y stock sincronizado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_alertas_stock_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    return _json_ok(alertas=[{"cod_alerta": a.cod_alerta, "producto": a.cod_producto.nombre, "almacen": a.cod_almacen.nombre, "tipo": a.tipo_alerta, "mensaje": a.mensaje, "atendida": a.atendida, "fecha": _dt(a.fecha_creacion)} for a in panel_service.listar_alertas_stock()])


@login_required(login_url="/login/")
@require_POST
def api_accion_inventario_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        accion = request.POST.get("accion")
        if accion == "recalcular":
            recalcular_inventario_desde_lotes(_post_int(request, "cod_producto", False), _post_int(request, "cod_almacen", False))
        elif accion == "reponer":
            generar_reposicion_automatica(_post_int(request, "cod_producto"), _post_int(request, "cod_almacen"))
        elif accion == "resolver_alerta":
            resolver_alerta_stock(_post_int(request, "cod_alerta"), request.POST.get("observacion") or None)
        else:
            return _json_error("Acción de inventario no soportada.", status=400)
        return _json_ok(mensaje="Operación de inventario completada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_proveedor_admin(request, cod_proveedor=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_proveedor is None:
            ident = crear_proveedor(request.POST["ruc"], request.POST["razon_social"], request.POST.get("nombre_comercial") or None, request.POST["email"], request.POST.get("telefono") or None, request.POST.get("direccion") or None, request.POST.get("ciudad") or None, request.POST.get("provincia") or None)
            return _json_ok(cod_proveedor=ident, mensaje="Proveedor creado.")
        if _post_bool(request, "desactivar"):
            eliminar_proveedor_logico(cod_proveedor)
        else:
            actualizar_proveedor(cod_proveedor, request.POST.get("razon_social") or None, request.POST.get("nombre_comercial") or None, request.POST.get("email") or None, request.POST.get("telefono") or None, request.POST.get("direccion") or None, request.POST.get("ciudad") or None, request.POST.get("provincia") or None, _post_decimal(request, "calificacion", False), _post_bool(request, "activo", True))
        return _json_ok(mensaje="Proveedor actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_usuario_proveedor_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        usuario, proveedor = _post_int(request, "cod_usuario"), _post_int(request, "cod_proveedor")
        if _post_bool(request, "desasociar"):
            desasociar_usuario_proveedor(usuario, proveedor)
            return _json_ok(mensaje="Acceso de proveedor desactivado.")
        ident = asociar_usuario_proveedor(usuario, proveedor)
        return _json_ok(cod_usuario_proveedor=ident, mensaje="Acceso de proveedor asociado.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_abastecimiento_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    return _json_ok(ordenes=[{"cod_orden_abastecimiento": o.cod_orden_abastecimiento, "proveedor": o.cod_proveedor.razon_social, "almacen": o.cod_almacen.nombre if o.cod_almacen else None, "estado": o.estado, "total_estimado": _money(o.total_estimado), "fecha": _dt(o.fecha_creacion)} for o in panel_service.listar_ordenes_abastecimiento()])


@login_required(login_url="/login/")
@require_POST
def api_accion_abastecimiento_admin(request, cod_orden_abastecimiento):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if request.POST.get("accion") == "recibir":
            recibir_orden_abastecimiento(cod_orden_abastecimiento, _post_int(request, "cod_almacen"), request.POST.get("observacion") or "Recepción desde panel administrativo")
        elif request.POST.get("accion") == "cancelar":
            cancelar_orden_abastecimiento(cod_orden_abastecimiento, request.POST.get("motivo") or "Cancelada por administración")
        else:
            return _json_error("Acción de abastecimiento no soportada.", status=400)
        return _json_ok(mensaje="Orden de abastecimiento actualizada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_contacto_proveedor_admin(request, cod_proveedor):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        ident = crear_contacto_proveedor(cod_proveedor, request.POST["nombre"], request.POST.get("cargo") or None, request.POST.get("email") or None, request.POST.get("telefono") or None, _post_bool(request, "principal"))
        return _json_ok(cod_contacto=ident, mensaje="Contacto registrado.")
    except KeyError as exc:
        return _json_error(f"Falta el campo {exc.args[0]}.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_producto_proveedor_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        producto = _post_int(request, "cod_producto")
        proveedor = _post_int(request, "cod_proveedor")
        if _post_bool(request, "desasociar"):
            desasociar_producto_proveedor(producto, proveedor)
            return _json_ok(mensaje="Relación con proveedor desactivada.")
        ident = asociar_producto_proveedor(producto, proveedor, request.POST["sku_proveedor"], _post_decimal(request, "costo_unitario"), _post_decimal(request, "precio_sugerido", False), _post_int(request, "tiempo_entrega_dias", False) or 3, _post_int(request, "prioridad", False) or 100, _post_int(request, "pedido_minimo", False) or 1, _post_int(request, "pedido_maximo", False), _post_int(request, "cantidad_disponible", False) or 0)
        return _json_ok(cod_producto_proveedor=ident, mensaje="Producto asociado al proveedor.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_cupon_admin(request, cod_cupon=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_cupon is None:
            ident = crear_cupon(request.POST["codigo"], request.POST["nombre"], request.POST["tipo_descuento"], _post_decimal(request, "valor"), _post_decimal(request, "monto_minimo", False) or 0, _post_int(request, "usos_maximos", False), _post_int(request, "usos_por_usuario", False) or 1, _post_int(request, "dias_vigencia", False) or 30, request.POST.get("descripcion") or None)
            return _json_ok(cod_cupon=ident, mensaje="Cupón creado.")
        if _post_bool(request, "desactivar"):
            desactivar_cupon(cod_cupon)
        else:
            actualizar_cupon(cod_cupon, request.POST["nombre"], _post_decimal(request, "valor"), _post_bool(request, "activo", True))
        return _json_ok(mensaje="Cupón actualizado.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_promocion_admin(request, cod_promocion=None):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if cod_promocion is None:
            ident = crear_promocion(request.POST["codigo"], request.POST["nombre"], request.POST["tipo_descuento"], _post_decimal(request, "valor"), request.POST["fecha_inicio"], request.POST["fecha_fin"], request.POST.get("descripcion") or None, _post_bool(request, "acumulable"))
            return _json_ok(cod_promocion=ident, mensaje="Promoción creada.")
        if _post_bool(request, "desactivar"):
            desactivar_promocion(cod_promocion)
        else:
            actualizar_promocion(cod_promocion, request.POST["nombre"], _post_decimal(request, "valor"), _post_bool(request, "activo", True))
        return _json_ok(mensaje="Promoción actualizada.")
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_promocion_producto_admin(request, cod_promocion):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        asociar_promocion_producto(cod_promocion, _post_int(request, "cod_producto"))
        return _json_ok(mensaje="Producto asociado a la promoción.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_detalle_pedido_admin(request, cod_pedido):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        pedido, detalles, lotes = panel_service.detalle_pedido(cod_pedido)
        factura = getattr(pedido, "factura", None)
        return _json_ok(
            pedido={"cod_pedido": pedido.cod_pedido, "numero_pedido": pedido.numero_pedido, "estado": pedido.cod_estado_pedido_id, "cliente": pedido.cod_usuario.email, "total": _money(pedido.total), "direccion": pedido.cod_direccion_envio.linea1, "factura": factura.numero_factura if factura else None},
            detalles=[{"producto": d.cod_producto.nombre, "cantidad": d.cantidad, "precio_final": _money(d.precio_final_unitario), "subtotal": _money(d.subtotal_linea)} for d in detalles],
            lotes=[{"producto": l.cod_pedido_detalle.cod_producto.nombre, "lote": l.cod_lote.numero_lote, "cantidad": l.cantidad, "pvp_historico": _money(l.pvp_unitario_historico), "subtotal": _money(l.subtotal_linea_lote)} for l in lotes],
        )
    except Exception as exc:
        return _json_error(_safe_error(exc, "Pedido no encontrado."), status=404)


@login_required(login_url="/login/")
@require_GET
def api_pagos_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    data = panel_service.listar_pagos()
    return _json_ok(
        transacciones=[{"cod_transaccion": t.cod_transaccion, "pedido": t.cod_pedido.numero_pedido, "monto": _money(t.monto), "estado": t.cod_estado_pago_id, "fecha": _dt(t.fecha_creacion)} for t in data["transacciones"]],
        autorizaciones=[{"cod_autorizacion": a.cod_autorizacion, "transaccion": a.cod_transaccion_id, "monto": _money(a.monto_autorizado), "fecha": _dt(a.fecha_autorizacion)} for a in data["autorizaciones"]],
        reembolsos=[{"cod_reembolso": r.cod_reembolso, "transaccion": r.cod_transaccion_id, "monto": _money(r.monto), "estado": r.estado, "fecha": _dt(r.fecha_reembolso)} for r in data["reembolsos"]],
        facturas=[{"cod_factura": f.cod_factura, "pedido": f.cod_pedido.numero_pedido, "numero_factura": f.numero_factura, "total": _money(f.total), "estado": f.estado, "fecha": _dt(f.fecha_emision)} for f in data["facturas"]],
    )


@login_required(login_url="/login/")
@require_GET
def api_tracking_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    data = panel_service.listar_tracking()
    return _json_ok(
        envios=[{"cod_envio": e.cod_envio, "pedido": e.cod_pedido.numero_pedido, "tracking": e.numero_tracking, "estado": e.estado_envio or e.estado, "transportista": e.cod_transportista.nombre if e.cod_transportista else None, "entrega": _dt(e.fecha_entrega)} for e in data["envios"]],
        programaciones=[{"cod_programacion": p.cod_programacion, "cod_envio": p.cod_envio_id, "evento": p.cod_tipo_evento_id, "descripcion": p.descripcion, "fecha_programada": _dt(p.fecha_programada), "procesado": p.procesado, "orden": p.orden} for p in data["programaciones"]],
    )


@login_required(login_url="/login/")
@require_POST
def api_accion_tracking_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    try:
        if request.POST.get("accion") == "procesar":
            cantidad = procesar_tracking_pendiente()
            return _json_ok(procesados=cantidad, mensaje="Tracking pendiente procesado.")
        if request.POST.get("accion") == "estado_envio":
            actualizar_envio_estado(_post_int(request, "cod_envio"), request.POST["estado"], request.POST.get("comentario") or None)
            return _json_ok(mensaje="Estado de envío actualizado.")
        return _json_error("Acción de tracking no soportada.", status=400)
    except (KeyError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_prime_admin(request):
    error = _exigir_admin(request)
    if error:
        return error
    data = panel_service.listar_prime()
    return _json_ok(
        planes=data["planes"],
        beneficios=[{"cod_beneficio": b.cod_beneficio, "plan": b.cod_plan.nombre, "codigo": b.codigo, "nombre": b.nombre, "valor": _money(b.valor), "activo": b.activo} for b in data["beneficios"]],
        membresias=[{"cod_membresia": m.cod_membresia, "usuario": m.cod_usuario.email, "plan": m.cod_plan.nombre, "estado": m.cod_estado_membresia_id, "inicio": m.fecha_inicio.isoformat(), "fin": m.fecha_fin.isoformat()} for m in data["membresias"]],
        usos=[{"cod_uso_beneficio": u.cod_uso_beneficio, "usuario": u.cod_usuario.email, "beneficio": u.cod_beneficio.nombre, "pedido": u.cod_pedido_id, "valor": _money(u.valor_aplicado), "fecha": _dt(u.fecha_uso)} for u in data["usos"]],
    )
