from decimal import Decimal

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from apps.administracion.models import (
    Categoria,
    Producto,
    ProductoAtributoValor,
    ProductoImagen,
    ProductoRelacionado,
    ProductoResena,
)
from apps.administracion.services.producto_service import (
    precio_producto_con_promocion,
    registrar_busqueda,
    registrar_producto_visto,
    stock_disponible_producto,
)
from apps.clientes.models import (
    Carrito,
    CarritoDetalle,
    BeneficioMembresia,
    CompraRecurrente,
    CompraRecurrenteDetalle,
    MembresiaUsuario,
    PagoMembresia,
    PlanMembresia,
    ProductoFavorito,
    ProductoPregunta,
    ProductoRespuesta,
)
from apps.clientes.services.carrito_service import (
    actualizar_cantidad_carrito,
    agregar_producto_carrito,
    calcular_precio_final_item,
    cotizar_producto_por_lotes,
    eliminar_producto_carrito,
    obtener_o_crear_carrito_activo,
    total_carrito,
    validar_checkout_carrito,
)
from apps.clientes.services.checkout_service import (
    aplicar_cupon_pedido,
    cancelar_pedido,
    crear_pedido_desde_carrito,
    solicitar_devolucion_total,
)
from apps.clientes.services.membresia_service import activar_membresia_usuario, cancelar_membresia_usuario
from apps.clientes.services.producto_service import crear_resena_producto, registrar_pregunta_producto
from apps.clientes.services.recurrente_service import (
    actualizar_compra_recurrente,
    agregar_producto_compra_recurrente,
    crear_compra_recurrente,
    preparar_carrito_compra_recurrente,
)
from apps.clientes.services.wishlist_service import agregar_a_wishlist, quitar_de_wishlist
from apps.core.models import DireccionUsuario
from apps.operaciones.models import Envio, MetodoEnvio, Pedido, PedidoDetalle, ZonaEntrega
from apps.operaciones.services.tracking_service import consultar_tracking_persistente, procesar_tracking_pendiente


def _money(value):
    if value is None:
        return "0.00"
    if isinstance(value, Decimal):
        return f"{value:.2f}"
    return str(value)


def _dt(value):
    return value.isoformat() if value else None


def _json_ok(**data):
    payload = {"ok": True}
    payload.update(data)
    return JsonResponse(payload)


def _json_error(mensaje, status=400, **extra):
    payload = {"ok": False, "mensaje": mensaje}
    payload.update(extra)
    return JsonResponse(payload, status=status)


def _safe_error(exc, mensaje="No se pudo completar la operación."):
    return str(exc) if settings.DEBUG else mensaje


def _normalizar_checkout_resultado(resultado):
    """Convierte el JSONB de PostgreSQL a dict usable aunque el driver lo devuelva como texto."""
    if isinstance(resultado, dict):
        return resultado
    if isinstance(resultado, str):
        import json
        try:
            return json.loads(resultado)
        except Exception:
            return {"valido": False, "errores": [resultado]}
    return {"valido": bool(resultado), "errores": [] if resultado else ["No se pudo validar el carrito."]}




def _usuario_es_prime(user):
    if not user or not user.is_authenticated:
        return False
    return MembresiaUsuario.objects.filter(cod_usuario=user, cod_estado_membresia_id="ACTIVA").exists()


def _estado_cliente(user):
    if not user or not user.is_authenticated:
        return "VISITANTE"
    return "PRIME" if _usuario_es_prime(user) else "CLIENTE"


def _prime_preview():
    return [
        {"codigo": "ENVIO_GRATIS", "nombre": "Envío gratis", "descripcion": "Métodos elegibles sin costo."},
        {"codigo": "ENTREGA_PRIORITARIA", "nombre": "Entrega prioritaria", "descripcion": "Preparación preferente del pedido."},
        {"codigo": "DESCUENTOS_EXCLUSIVOS", "nombre": "Descuentos exclusivos", "descripcion": "Promociones visibles para miembros Prime."},
        {"codigo": "DEVOLUCION_EXTENDIDA", "nombre": "Devolución extendida", "descripcion": "Mayor plazo para solicitar devolución."},
    ]


def _imagen_producto(cod_producto):
    img = ProductoImagen.objects.filter(cod_producto_id=cod_producto, activo=True, es_principal=True).first()
    if not img:
        img = ProductoImagen.objects.filter(cod_producto_id=cod_producto, activo=True).order_by("orden").first()
    return img.url_imagen if img else ""


def _producto_json(producto, incluir_detalle=False, user=None):
    precio_final = None
    try:
        precio_final = precio_producto_con_promocion(producto.cod_producto)
    except Exception:
        precio_final = producto.precio_actual

    stock = None
    try:
        stock = stock_disponible_producto(producto.cod_producto)
    except Exception:
        stock = None

    estado_cliente = _estado_cliente(user)
    es_prime = estado_cliente == "PRIME"
    autenticado = estado_cliente != "VISITANTE"

    precio_anterior = None
    descuento = None
    if precio_final and producto.precio_actual and float(precio_final) < float(producto.precio_actual):
        precio_anterior = _money(producto.precio_actual)
        try:
            pct = int(round((1 - float(precio_final) / float(producto.precio_actual)) * 100))
            descuento = f"-{pct}%"
        except Exception:
            descuento = "-10%"

    resenas_qs = ProductoResena.objects.filter(cod_producto=producto, aprobado=True)
    if resenas_qs.exists():
        avg = sum(r.calificacion for r in resenas_qs) / resenas_qs.count()
        rating = round(avg, 1)
        num_resenas = resenas_qs.count()
    else:
        rating = 4.8
        num_resenas = 14

    data = {
        "cod_producto": producto.cod_producto,
        "sku": producto.sku,
        "nombre": producto.nombre,
        "descripcion": producto.descripcion if incluir_detalle else (producto.descripcion[:180] + "..." if len(producto.descripcion) > 180 else producto.descripcion),
        "precio_actual": _money(producto.precio_actual),
        "precio_final": _money(precio_final),
        "precio_anterior": precio_anterior,
        "descuento": descuento,
        "rating": rating,
        "num_resenas": num_resenas,
        "categoria": getattr(producto.cod_categoria, "nombre", ""),
        "cod_categoria": getattr(producto.cod_categoria, "cod_categoria", None),
        "marca": getattr(producto.cod_marca, "nombre", ""),
        "imagen": _imagen_producto(producto.cod_producto),
        "estado": producto.cod_estado_producto_id,
        "stock_disponible": stock,
        "stock_label": "Sin stock" if stock == 0 else ("Stock por confirmar" if stock is None else ("Últimas unidades" if stock <= 5 else "Disponible")),
        "puede_comprar": bool(autenticado and (stock is None or stock > 0)),
        "requiere_login": not autenticado,
        "estado_cliente": estado_cliente,
        "es_prime": es_prime,
        "prime_preview": _prime_preview(),
    }

    if incluir_detalle:
        data.update({
            "peso_kg": _money(producto.peso_kg),
            "largo_cm": _money(producto.largo_cm),
            "ancho_cm": _money(producto.ancho_cm),
            "alto_cm": _money(producto.alto_cm),
            "metadata": producto.metadata or {},
            "favorito": False,
        })
        if user and user.is_authenticated:
            data["favorito"] = ProductoFavorito.objects.filter(cod_usuario=user, cod_producto=producto).exists()

    return data

@ensure_csrf_cookie
def inicio_view(request):
    return render(request, "clientes/inicio.html")


@ensure_csrf_cookie
def catalogo_view(request):
    """Página pública: los precios y stock reales continúan viniendo de APIs/services."""
    return render(request, "clientes/catalogo.html")


@ensure_csrf_cookie
def producto_detalle_view(request, cod_producto):
    # Solo comprobamos que exista/publicado; la ficha comercial se carga mediante la API existente.
    get_object_or_404(Producto, cod_producto=cod_producto, cod_estado_producto_id="PUBLICADO")
    return render(request, "clientes/producto_detalle.html", {"cod_producto": cod_producto})


@login_required(login_url="/login/")
@ensure_csrf_cookie
def carrito_view(request):
    return render(request, "clientes/carrito.html")


@login_required(login_url="/login/")
@ensure_csrf_cookie
def pedidos_view(request):
    return render(request, "clientes/pedidos.html")


@login_required(login_url="/login/")
@ensure_csrf_cookie
def checkout_view(request):
    return render(request, "clientes/checkout.html")


@login_required(login_url="/login/")
@ensure_csrf_cookie
def checkout_prime_view(request, cod_plan):
    plan = get_object_or_404(PlanMembresia, cod_plan=cod_plan, activo=True)
    return render(request, "clientes/checkout_prime.html", {"plan": plan})


@require_GET
def api_categorias(request):
    categorias = Categoria.objects.filter(activo=True).order_by("nombre")
    return _json_ok(
        categorias=[
            {
                "cod_categoria": c.cod_categoria,
                "nombre": c.nombre,
                "slug": c.slug,
                "descripcion": c.descripcion,
            }
            for c in categorias
        ]
    )


@require_GET
def api_productos(request):
    q = (request.GET.get("q") or "").strip()
    cod_categoria = request.GET.get("categoria") or ""
    orden = request.GET.get("orden") or "nombre"
    page = int(request.GET.get("page") or 1)
    per_page = min(int(request.GET.get("per_page") or 12), 36)

    qs = (
        Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto")
        .filter(cod_estado_producto_id="PUBLICADO")
    )

    if q:
        qs = qs.filter(nombre__icontains=q)

    if cod_categoria:
        if str(cod_categoria).isdigit():
            qs = qs.filter(cod_categoria_id=cod_categoria)
        else:
            qs = qs.filter(cod_categoria__nombre__icontains=cod_categoria)

    if orden == "precio":
        qs = qs.order_by("precio_actual", "nombre")
    elif orden == "-precio":
        qs = qs.order_by("-precio_actual", "nombre")
    elif orden == "nuevo":
        qs = qs.order_by("-fecha_creacion", "nombre")
    elif orden == "-nombre":
        qs = qs.order_by("-nombre")
    else:
        qs = qs.order_by("nombre")

    paginator = Paginator(qs, per_page)
    page_obj = paginator.get_page(page)

    if q:
        try:
            registrar_busqueda(request.user.cod_usuario if request.user.is_authenticated else None, q, paginator.count)
        except Exception:
            pass

    return _json_ok(
        productos=[_producto_json(p, user=request.user) for p in page_obj.object_list],
        paginacion={
            "page": page_obj.number,
            "num_pages": paginator.num_pages,
            "total": paginator.count,
            "has_next": page_obj.has_next(),
            "has_previous": page_obj.has_previous(),
        },
    )


@require_GET
def api_productos_destacados(request):
    productos = (
        Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto")
        .filter(cod_estado_producto_id="PUBLICADO")
        .order_by("-fecha_creacion")[:12]
    )
    return _json_ok(productos=[_producto_json(p, user=request.user) for p in productos])


@require_GET
def api_productos_mas_vendidos(request):
    productos = (
        Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto")
        .filter(cod_estado_producto_id="PUBLICADO")
        .order_by("cod_producto")[:12]
    )
    return _json_ok(productos=[_producto_json(p, user=request.user) for p in productos])


@require_GET
def api_productos_nuevos(request):
    productos = (
        Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto")
        .filter(cod_estado_producto_id="PUBLICADO")
        .order_by("-fecha_creacion", "-cod_producto")[:12]
    )
    return _json_ok(productos=[_producto_json(p, user=request.user) for p in productos])


@require_GET
def api_productos_ofertas(request):
    productos = (
        Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto")
        .filter(cod_estado_producto_id="PUBLICADO")
        .order_by("precio_actual")[:12]
    )
    return _json_ok(productos=[_producto_json(p, user=request.user) for p in productos])


@require_GET
def api_productos_autocompletar(request):
    query = (request.GET.get("q") or "").strip()
    if not query:
        return _json_ok(sugerencias=[])
    productos = (
        Producto.objects.select_related("cod_categoria", "cod_marca")
        .filter(cod_estado_producto_id="PUBLICADO")
        .filter(nombre__icontains=query)
        .order_by("nombre")[:8]
    )
    sugerencias = [
        {
            "cod_producto": p.cod_producto,
            "nombre": p.nombre,
            "titulo": p.nombre,
            "categoria": p.cod_categoria.nombre if p.cod_categoria else "",
            "marca": p.cod_marca.nombre if p.cod_marca else "",
            "precio_actual": _money(p.precio_actual),
        }
        for p in productos
    ]
    return _json_ok(sugerencias=sugerencias)


@require_GET
def api_producto_detalle(request, cod_producto):
    producto = get_object_or_404(
        Producto.objects.select_related("cod_categoria", "cod_marca", "cod_estado_producto"),
        cod_producto=cod_producto,
        cod_estado_producto_id="PUBLICADO",
    )
    if request.user.is_authenticated:
        try:
            registrar_producto_visto(request.user.cod_usuario, cod_producto)
        except Exception:
            pass
    resenas = ProductoResena.objects.filter(cod_producto=producto, aprobado=True).order_by("-fecha_creacion")[:5]
    data = _producto_json(producto, incluir_detalle=True, user=request.user)
    data["resenas"] = [
        {
            "calificacion": r.calificacion,
            "titulo": r.titulo,
            "comentario": r.comentario,
            "fecha": _dt(r.fecha_creacion),
        }
        for r in resenas
    ]
    if request.user.is_authenticated:
        resena_usuario = ProductoResena.objects.filter(
            cod_producto=producto,
            cod_usuario=request.user,
        ).first()
        compra_verificada = PedidoDetalle.objects.filter(
            cod_producto=producto,
            cod_pedido__cod_usuario=request.user,
            cod_pedido__cod_estado_pedido_id="ENTREGADO",
        ).exists()
        data["compra_verificada"] = compra_verificada
        data["puede_resenar"] = compra_verificada and resena_usuario is None
        data["resena_usuario"] = (
            {
                "calificacion": resena_usuario.calificacion,
                "titulo": resena_usuario.titulo,
                "comentario": resena_usuario.comentario,
                "aprobado": resena_usuario.aprobado,
                "fecha": _dt(resena_usuario.fecha_creacion),
            }
            if resena_usuario
            else None
        )
    else:
        data["compra_verificada"] = False
        data["puede_resenar"] = False
        data["resena_usuario"] = None
    data["imagenes"] = [
        {
            "url": imagen.url_imagen,
            "alt": imagen.alt_text or producto.nombre,
            "principal": imagen.es_principal,
            "orden": imagen.orden,
        }
        for imagen in ProductoImagen.objects.filter(cod_producto=producto, activo=True).order_by("-es_principal", "orden")
    ]
    data["atributos"] = [
        {"nombre": atributo.cod_atributo.nombre, "valor": atributo.valor}
        for atributo in ProductoAtributoValor.objects.select_related("cod_atributo").filter(cod_producto=producto, activo=True, cod_atributo__activo=True).order_by("cod_atributo__nombre")
    ]
    metadata = producto.metadata if isinstance(producto.metadata, dict) else {}
    data["videos"] = metadata.get("videos", [])
    data["ficha_tecnica"] = metadata.get("ficha_tecnica")
    data["relacionados"] = [
        {
            "cod_producto": relacion.cod_producto_relacionado.cod_producto,
            "nombre": relacion.cod_producto_relacionado.nombre,
            "precio_desde": _money(relacion.cod_producto_relacionado.precio_actual),
            "imagen": _imagen_producto(relacion.cod_producto_relacionado.cod_producto),
            "tipo": relacion.tipo_relacion,
        }
        for relacion in ProductoRelacionado.objects.select_related("cod_producto_relacionado")
        .filter(cod_producto=producto, cod_producto_relacionado__cod_estado_producto_id="PUBLICADO")[:8]
    ]
    return _json_ok(producto=data)


@require_GET
def api_preguntas_producto(request, cod_producto):
    preguntas = ProductoPregunta.objects.filter(cod_producto_id=cod_producto).order_by("-fecha_creacion")[:20]
    data = []
    for p in preguntas:
        respuesta = ProductoRespuesta.objects.filter(cod_pregunta=p).first()
        data.append({
            "cod_pregunta": p.cod_pregunta,
            "pregunta": p.pregunta,
            "estado": p.estado,
            "fecha": _dt(p.fecha_creacion),
            "respuesta": respuesta.respuesta if respuesta else None,
        })
    return _json_ok(preguntas=data)


@login_required(login_url="/login/")
@require_POST
def api_crear_resena_producto(request, cod_producto):
    try:
        calificacion = int(request.POST.get("calificacion") or 0)
    except (TypeError, ValueError):
        calificacion = 0

    titulo = (request.POST.get("titulo") or "").strip()
    comentario = (request.POST.get("comentario") or "").strip()

    if calificacion not in range(1, 6):
        return _json_error("Selecciona una calificación entre 1 y 5 estrellas.")
    if len(titulo) > 160:
        return _json_error("El título no puede superar 160 caracteres.")
    if len(comentario) < 10:
        return _json_error("La reseña debe tener al menos 10 caracteres.")
    if len(comentario) > 2000:
        return _json_error("La reseña no puede superar 2000 caracteres.")

    try:
        cod_resena = crear_resena_producto(
            request.user.cod_usuario,
            cod_producto,
            calificacion,
            titulo or None,
            comentario,
        )
        return _json_ok(
            mensaje="Tu reseña fue enviada y está pendiente de moderación.",
            cod_resena=cod_resena,
            estado="PENDIENTE",
        )
    except Exception as exc:
        detalle = str(exc)
        mensajes_permitidos = (
            "Solo puedes reseñar productos de pedidos entregados.",
            "Ya registraste una reseña para este producto.",
            "El producto no existe.",
            "El usuario no existe o está inactivo.",
        )
        mensaje = next((item for item in mensajes_permitidos if item in detalle), None)
        return _json_error(mensaje or "No se pudo registrar la reseña.", status=400)


@login_required(login_url="/login/")
@require_POST
def api_preguntar_producto(request, cod_producto):
    pregunta = (request.POST.get("pregunta") or "").strip()
    if len(pregunta) < 5:
        return _json_error("Escribe una pregunta más clara.")
    try:
        cod = registrar_pregunta_producto(request.user.cod_usuario, cod_producto, pregunta)
        return _json_ok(mensaje="Pregunta registrada.", cod_pregunta=cod)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_cotizar_producto_lotes(request, cod_producto):
    try:
        cantidad = int(request.GET.get("cantidad") or 1)
        if cantidad <= 0:
            return _json_error("La cantidad debe ser mayor a cero.")

        cotizacion = _normalizar_checkout_resultado(
            cotizar_producto_por_lotes(request.user.cod_usuario, cod_producto, cantidad)
        )
        cantidad_cubierta = int(cotizacion.get("cantidad_cubierta") or 0)
        precio_final = None
        if cantidad_cubierta:
            subtotal_lotes = Decimal(str(cotizacion.get("subtotal_total") or 0))
            precio_base = subtotal_lotes / cantidad_cubierta
            precio_final = _normalizar_checkout_resultado(
                calcular_precio_final_item(
                    request.user.cod_usuario,
                    cod_producto,
                    cantidad_cubierta,
                    precio_base,
                    request.GET.get("codigo_cupon") or None,
                )
            )

        mensajes = []
        if cotizacion.get("cantidad_faltante"):
            mensajes.append("Parte de la cantidad requiere cobertura de proveedor.")
        if not cantidad_cubierta:
            mensajes.append("No existe stock propio disponible para la cotización.")

        return _json_ok(
            cantidad_solicitada=cotizacion.get("cantidad_solicitada", cantidad),
            cantidad_cubierta=cantidad_cubierta,
            cantidad_faltante=cotizacion.get("cantidad_faltante", 0),
            lotes=cotizacion.get("lotes", []),
            subtotal_lotes=_money(cotizacion.get("subtotal_total")),
            precio_final=precio_final,
            total_estimado=_money((precio_final or {}).get("subtotal", cotizacion.get("subtotal_total"))),
            requiere_proveedor=bool(cotizacion.get("requiere_proveedor")),
            tiempo_estimado_dias=cotizacion.get("tiempo_estimado_dias"),
            mensajes=mensajes,
        )
    except ValueError:
        return _json_error("Datos de cotización inválidos.")
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo cotizar el producto."), status=500)


@login_required(login_url="/login/")
@require_GET
def api_carrito(request):
    cod_carrito = obtener_o_crear_carrito_activo(request.user.cod_usuario)
    carrito = Carrito.objects.filter(cod_carrito=cod_carrito).first()
    detalles = (
        CarritoDetalle.objects.select_related("cod_producto", "cod_producto__cod_marca", "cod_producto__cod_categoria")
        .filter(cod_carrito=carrito)
        .order_by("-fecha_creacion")
    )
    total = total_carrito(cod_carrito)
    items = []
    for detalle in detalles:
        cotizacion = None
        try:
            cotizacion = _normalizar_checkout_resultado(
                calcular_precio_final_item(
                    request.user.cod_usuario,
                    detalle.cod_producto_id,
                    detalle.cantidad,
                    detalle.precio_unitario_snapshot,
                )
            )
        except Exception:
            cotizacion = None
        items.append({
            "cod_producto": detalle.cod_producto.cod_producto,
            "nombre": detalle.cod_producto.nombre,
            "marca": detalle.cod_producto.cod_marca.nombre,
            "imagen": _imagen_producto(detalle.cod_producto.cod_producto),
            "cantidad": detalle.cantidad,
            "precio_unitario": _money(detalle.precio_unitario_snapshot),
            "subtotal": _money(detalle.precio_unitario_snapshot * detalle.cantidad),
            "cotizacion": cotizacion,
        })
    return _json_ok(
        cod_carrito=cod_carrito,
        total=_money(total),
        cantidad_items=sum(d.cantidad for d in detalles),
        items=items,
        desglose={
            "subtotal_carrito": _money(total),
            "descuento": None,
            "impuesto": None,
            "costo_envio": None,
            "total_estimado": _money(total),
            "mensaje": "El precio final, impuesto y envío se recalculan en PostgreSQL al seleccionar dirección y método de envío.",
        },
    )


@login_required(login_url="/login/")
@require_POST
def api_carrito_agregar(request):
    try:
        cod_producto = int(request.POST.get("cod_producto"))
        cantidad = int(request.POST.get("cantidad") or 1)
        if cantidad <= 0:
            return _json_error("La cantidad debe ser mayor a cero.")
        cod_detalle = agregar_producto_carrito(request.user.cod_usuario, cod_producto, cantidad)
        return _json_ok(mensaje="Producto agregado al carrito.", cod_carrito_detalle=cod_detalle)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_carrito_actualizar(request):
    try:
        cod_producto = int(request.POST.get("cod_producto"))
        cantidad = int(request.POST.get("cantidad") or 1)
        actualizar_cantidad_carrito(request.user.cod_usuario, cod_producto, cantidad)
        return _json_ok(mensaje="Cantidad actualizada.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_carrito_eliminar(request):
    try:
        cod_producto = int(request.POST.get("cod_producto"))
        eliminar_producto_carrito(request.user.cod_usuario, cod_producto)
        return _json_ok(mensaje="Producto eliminado del carrito.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_GET
def api_carrito_validar(request):
    try:
        resultado = _normalizar_checkout_resultado(validar_checkout_carrito(request.user.cod_usuario))
        return _json_ok(resultado=resultado)
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo validar el carrito."), status=500)


@login_required(login_url="/login/")
@require_POST
def api_checkout_crear_pedido(request):
    try:
        cod_direccion = int(request.POST.get("cod_direccion_envio"))
        cod_metodo_envio_raw = request.POST.get("cod_metodo_envio") or None
        cod_metodo_envio = int(cod_metodo_envio_raw) if cod_metodo_envio_raw else None
        cod_zona_raw = request.POST.get("cod_zona_entrega") or None
        cod_zona_entrega = int(cod_zona_raw) if cod_zona_raw else None

        direccion = DireccionUsuario.objects.filter(
            cod_direccion=cod_direccion,
            cod_usuario=request.user,
            activo=True,
        ).first()
        if not direccion:
            return _json_error("Dirección de envío inválida.", status=403)

        if cod_metodo_envio and not MetodoEnvio.objects.filter(
            cod_metodo_envio=cod_metodo_envio, activo=True
        ).exists():
            return _json_error("Metodo de envio invalido.", status=400)

        zona = ZonaEntrega.objects.filter(
            ciudad=direccion.ciudad,
            provincia=direccion.provincia,
            activo=True,
        ).first()
        if not zona:
            return _json_error("No existe una zona de entrega activa para la direccion indicada.", status=409)
        if cod_zona_entrega and zona.cod_zona != cod_zona_entrega:
            return _json_error("La zona de entrega no corresponde a la direccion indicada.", status=400)

        validacion = _normalizar_checkout_resultado(validar_checkout_carrito(request.user.cod_usuario))
        if not validacion.get("valido", False):
            return _json_error(
                "El carrito no está listo para checkout.",
                status=409,
                resultado=validacion,
            )

        cod_pedido = crear_pedido_desde_carrito(request.user.cod_usuario, cod_direccion, cod_metodo_envio)
        pedido = Pedido.objects.filter(cod_pedido=cod_pedido, cod_usuario=request.user).first()
        if not pedido:
            return _json_error("No se pudo leer el pedido generado.", status=500)
        return _json_ok(
            mensaje="Pedido creado. Continua con el pago.",
            cod_pedido=pedido.cod_pedido,
            estado=pedido.cod_estado_pedido_id,
            subtotal=_money(pedido.subtotal),
            descuento=_money(pedido.descuento),
            impuesto=_money(pedido.impuesto),
            costo_envio=_money(pedido.costo_envio),
            total=_money(pedido.total),
        )
    except ValueError:
        return _json_error("Datos de checkout inválidos.", status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo crear el pedido."), status=500)


@login_required(login_url="/login/")
@require_POST
def api_aplicar_cupon_pedido(request, cod_pedido):
    codigo_cupon = (request.POST.get("codigo_cupon") or "").strip()
    if not codigo_cupon:
        return _json_error("Debes indicar un cupón.")

    pedido = get_object_or_404(Pedido, cod_pedido=cod_pedido, cod_usuario=request.user)
    try:
        descuento_aplicado = aplicar_cupon_pedido(pedido.cod_pedido, codigo_cupon)
        pedido.refresh_from_db()
        return _json_ok(
            mensaje="Cupón aplicado.",
            cod_pedido=pedido.cod_pedido,
            descuento_aplicado=_money(descuento_aplicado),
            subtotal=_money(pedido.subtotal),
            descuento=_money(pedido.descuento),
            impuesto=_money(pedido.impuesto),
            costo_envio=_money(pedido.costo_envio),
            total=_money(pedido.total),
        )
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo aplicar el cupón."), status=409)


@login_required(login_url="/login/")
@require_GET
def api_mis_pedidos(request):
    pedidos = Pedido.objects.filter(cod_usuario=request.user).select_related("cod_estado_pedido").order_by("-fecha_creacion")[:30]
    return _json_ok(
        pedidos=[
            {
                "cod_pedido": p.cod_pedido,
                "numero_pedido": p.numero_pedido,
                "estado": p.cod_estado_pedido_id,
                "estado_nombre": p.cod_estado_pedido.nombre,
                "total": _money(p.total),
                "fecha": _dt(p.fecha_creacion),
                "requiere_abastecimiento": p.requiere_abastecimiento,
                "puede_cancelar": p.cod_estado_pedido_id in {"CREADO", "PENDIENTE_PAGO", "PAGO_AUTORIZADO", "PREPARANDO", "ESPERANDO_PROVEEDOR"},
                "puede_devolver": p.cod_estado_pedido_id == "ENTREGADO",
            }
            for p in pedidos
        ]
    )


@login_required(login_url="/login/")
@require_GET
def api_pedido_detalle(request, cod_pedido):
    pedido = get_object_or_404(Pedido.objects.select_related("cod_estado_pedido"), cod_pedido=cod_pedido, cod_usuario=request.user)
    detalles = PedidoDetalle.objects.filter(cod_pedido=pedido).select_related("cod_producto")
    return _json_ok(
        pedido={
            "cod_pedido": pedido.cod_pedido,
            "numero_pedido": pedido.numero_pedido,
            "estado": pedido.cod_estado_pedido_id,
            "total": _money(pedido.total),
            "subtotal": _money(pedido.subtotal),
            "descuento": _money(pedido.descuento),
            "impuesto": _money(pedido.impuesto),
            "costo_envio": _money(pedido.costo_envio),
        },
        items=[
            {
                "producto": d.cod_producto.nombre,
                "cantidad": d.cantidad,
                "precio_unitario": _money(d.precio_unitario),
                "subtotal": _money(d.subtotal_linea),
            }
            for d in detalles
        ],
    )


@login_required(login_url="/login/")
@require_GET
def _api_tracking_pedido_simulado_legacy(request, cod_pedido):
    pedido = get_object_or_404(Pedido, cod_pedido=cod_pedido, cod_usuario=request.user)
    envio = Envio.objects.filter(cod_pedido=pedido).first()
    eventos_db = []
    if envio:
        eventos_db = list(TrackingEvento.objects.filter(cod_envio=envio, visible_cliente=True).select_related("cod_tipo_evento").order_by("fecha_evento"))

    eventos = [
        {
            "tipo": e.cod_tipo_evento_id,
            "nombre": e.cod_tipo_evento.nombre,
            "descripcion": e.descripcion,
            "ubicacion": e.ubicacion,
            "fecha": _dt(e.fecha_evento),
            "completado": True,
            "origen": "BD",
        }
        for e in eventos_db
    ]

    # Tracking simulado progresivo para demo cliente. No reemplaza los eventos reales de BD: los complementa.
    if envio and pedido.cod_estado_pedido_id not in ("CANCELADO", "DEVUELTO", "REEMBOLSADO"):
        base = (envio.fecha_creacion if envio else None) or pedido.fecha_creacion or timezone.now()
        minutos = max(0, int((timezone.now() - base).total_seconds() // 60))
        plan = [
            (0, "ORDER_RECEIVED", "Pedido recibido", "Tu pedido fue registrado y está esperando confirmación de pago.", "TechTail"),
            (2, "PAYMENT_CONFIRMED", "Pago confirmado", "Pago aprobado por la pasarela simulada.", "Pasarela TechTail Pay"),
            (5, "PREPARING_PACKAGE", "Preparando paquete", "Estamos preparando tus productos en almacén.", "Centro logístico"),
            (10, "PACKAGE_READY", "Paquete listo", "El paquete quedó listo para retiro del transportista.", "Centro logístico"),
            (15, "PICKED_UP", "Retirado por transportista", "El transportista retiró el paquete.", getattr(envio.cod_transportista, "nombre", "Transportista")),
            (25, "IN_TRANSIT", "En tránsito", "Tu paquete viaja al centro de distribución local.", "Ruta nacional"),
            (40, "ARRIVED_LOCAL_CENTER", "Llegó a centro local", "El paquete llegó al centro local de destino.", "Centro local"),
            (55, "OUT_FOR_DELIVERY", "En reparto", "El paquete salió a reparto.", pedido.cod_direccion_envio.ciudad),
            (75, "DELIVERED", "Entregado", "Entrega completada al cliente.", pedido.cod_direccion_envio.ciudad),
        ]
        tipos_existentes = {e["tipo"] for e in eventos}
        for offset, tipo, nombre, descripcion, ubicacion in plan:
            if tipo in tipos_existentes:
                continue
            eventos.append({
                "tipo": tipo,
                "nombre": nombre,
                "descripcion": descripcion,
                "ubicacion": ubicacion,
                "fecha": _dt(base + timezone.timedelta(minutes=offset)),
                "completado": minutos >= offset,
                "origen": "SIMULADO",
            })

    orden = {
        "ORDER_RECEIVED": 10, "PAYMENT_CONFIRMED": 20, "PREPARING_PACKAGE": 30, "SUPPLIER_PENDING": 35,
        "PACKAGE_READY": 40, "PICKED_UP": 50, "IN_TRANSIT": 60, "ARRIVED_LOCAL_CENTER": 65,
        "OUT_FOR_DELIVERY": 70, "DELIVERED": 80, "ORDER_CANCELLED": 90, "RETURNING": 100, "RETURNED": 110, "REFUNDED": 120,
    }
    eventos.sort(key=lambda e: orden.get(e["tipo"], 999))
    progreso = 0
    if eventos:
        progreso = round((sum(1 for e in eventos if e.get("completado")) / len(eventos)) * 100)

    return _json_ok(
        envio={
            "numero_tracking": envio.numero_tracking if envio else None,
            "estado": envio.estado if envio else pedido.cod_estado_pedido_id,
            "fecha_estimada_entrega": envio.fecha_estimada_entrega.isoformat() if envio and envio.fecha_estimada_entrega else None,
            "progreso": progreso,
        },
        eventos=eventos,
    )

@login_required(login_url="/login/")
@require_GET
def api_tracking_pedido(request, cod_pedido):
    pedido = get_object_or_404(Pedido, cod_pedido=cod_pedido, cod_usuario=request.user)
    try:
        # En producción puede ejecutarlo un scheduler; en desarrollo también
        # se procesan los eventos vencidos al consultar el seguimiento.
        procesar_tracking_pendiente()
        pedido.refresh_from_db(fields=["cod_estado_pedido"])
    except Exception:
        # El historial ya persistido sigue disponible si un evento futuro falla.
        pass
    envio = Envio.objects.filter(cod_pedido=pedido).first()
    eventos = consultar_tracking_persistente(pedido.cod_pedido)

    progreso_por_estado = {
        "CREADO": 0,
        "PREPARANDO": 15,
        "LISTO_ENVIO": 30,
        "ENVIADO": 45,
        "EN_TRANSITO": 60,
        "CENTRO_LOCAL": 75,
        "EN_REPARTO": 90,
        "ENTREGADO": 100,
    }
    estado_envio = (envio.estado_envio or envio.estado) if envio else "CREADO"
    estado_pedido_equivalente = {
        "PENDIENTE_PAGO": "CREADO",
        "PAGO_AUTORIZADO": "CREADO",
        "ESPERANDO_PROVEEDOR": "PREPARANDO",
    }.get(pedido.cod_estado_pedido_id, pedido.cod_estado_pedido_id)
    if pedido.cod_estado_pedido_id in ("CANCELADO", "DEVOLUCION_SOLICITADA", "DEVUELTO", "REEMBOLSADO"):
        estado_mostrado = pedido.cod_estado_pedido_id
        progreso = 100
    else:
        estado_mostrado = max(
            (estado_envio, estado_pedido_equivalente),
            key=lambda estado: progreso_por_estado.get(estado, 0),
        )
        progreso = progreso_por_estado.get(estado_mostrado, 0)

    return _json_ok(
        envio={
            "numero_tracking": envio.numero_tracking if envio else None,
            "estado": estado_mostrado,
            "fecha_estimada_entrega": _dt(envio.fecha_estimada_entrega) if envio else None,
            "fecha_entrega": _dt(envio.fecha_entrega) if envio else None,
            "progreso": progreso,
        },
        eventos=[
            {
                "cod_tracking_evento": evento["cod_tracking_evento"],
                "tipo": evento["cod_tipo_evento_id"],
                "nombre": evento["cod_tipo_evento__nombre"],
                "descripcion": evento["descripcion"],
                "ubicacion": evento["ubicacion"],
                "visible_cliente": evento["visible_cliente"],
                "fecha": _dt(evento["fecha_evento"]),
                "orden": evento["orden"],
                "origen": "BD",
                "completado": True,
            }
            for evento in eventos
        ],
    )


@login_required(login_url="/login/")
@require_POST
def api_cancelar_pedido(request, cod_pedido):
    pedido = get_object_or_404(Pedido, cod_pedido=cod_pedido, cod_usuario=request.user)
    try:
        cancelar_pedido(pedido.cod_pedido, request.POST.get("motivo") or "Cancelación solicitada por cliente")
        return _json_ok(mensaje="Pedido cancelado.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_solicitar_devolucion_pedido(request, cod_pedido):
    pedido = get_object_or_404(Pedido, cod_pedido=cod_pedido, cod_usuario=request.user)
    motivo = (request.POST.get("motivo") or "Devolución solicitada por cliente").strip()
    if len(motivo) < 3:
        return _json_error("Indica un motivo de devolución.")
    try:
        cod_devolucion = solicitar_devolucion_total(
            pedido.cod_pedido, motivo, request.POST.get("descripcion") or None
        )
        return _json_ok(cod_devolucion=cod_devolucion, mensaje="Solicitud de devolución registrada.")
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo solicitar la devolución."), status=409)


@login_required(login_url="/login/")
@require_POST
def api_favorito_toggle(request):
    cod_producto = int(request.POST.get("cod_producto"))
    if ProductoFavorito.objects.filter(cod_usuario=request.user, cod_producto_id=cod_producto).exists():
        try:
            quitar_de_wishlist(request.user.cod_usuario, cod_producto)
        except Exception:
            pass
        ProductoFavorito.objects.filter(cod_usuario=request.user, cod_producto_id=cod_producto).delete()
        return _json_ok(mensaje="Quitado de favoritos.", favorito=False)
    try:
        agregar_a_wishlist(request.user.cod_usuario, cod_producto)
    except Exception:
        pass
    # Si la función de wishlist no crea producto_favorito, lo insertamos vía ORM solo si la tabla lo permite.
    try:
        with transaction.atomic():
            ProductoFavorito.objects.get_or_create(cod_usuario=request.user, cod_producto_id=cod_producto, defaults={"fecha_creacion": timezone.now()})
    except Exception:
        pass
    return _json_ok(mensaje="Agregado a favoritos.", favorito=True)


@login_required(login_url="/login/")
@require_GET
def api_favoritos(request):
    favoritos = (
        ProductoFavorito.objects.filter(
            cod_usuario=request.user,
            cod_producto__cod_estado_producto_id="PUBLICADO",
        )
        .select_related(
            "cod_producto__cod_categoria",
            "cod_producto__cod_marca",
            "cod_producto__cod_estado_producto",
        )
        .order_by("-fecha_creacion")
    )
    return _json_ok(
        favoritos=[_producto_json(item.cod_producto, user=request.user) for item in favoritos]
    )


@login_required(login_url="/login/")
@require_GET
def api_membresia(request):
    historial = list(MembresiaUsuario.objects.filter(cod_usuario=request.user).select_related("cod_plan", "cod_estado_membresia").order_by("-fecha_creacion"))
    membresia = historial[0] if historial else None
    planes = PlanMembresia.objects.filter(activo=True).order_by("precio_mensual")
    beneficios = BeneficioMembresia.objects.filter(cod_plan__in=planes, activo=True).order_by("cod_plan_id", "codigo")
    beneficios_por_plan = {}
    for b in beneficios:
        beneficios_por_plan.setdefault(b.cod_plan_id, []).append({
            "codigo": b.codigo,
            "nombre": b.nombre,
            "descripcion": b.descripcion,
            "valor": _money(b.valor) if b.valor is not None else None,
        })

    return _json_ok(
        membresia={
            "activa": bool(membresia and membresia.cod_estado_membresia_id == "ACTIVA"),
            "cod_membresia": membresia.cod_membresia if membresia else None,
            "plan": membresia.cod_plan.nombre if membresia else None,
            "cod_plan": membresia.cod_plan_id if membresia else None,
            "estado": membresia.cod_estado_membresia_id if membresia else None,
            "fecha_inicio": membresia.fecha_inicio.isoformat() if membresia else None,
            "fecha_fin": membresia.fecha_fin.isoformat() if membresia else None,
            "renovacion_automatica": membresia.renovacion_automatica if membresia else False,
        },
        planes=[
            {
                "cod_plan": p.cod_plan,
                "nombre": p.nombre,
                "precio_mensual": _money(p.precio_mensual),
                "duracion_dias": p.duracion_dias,
                "beneficios": beneficios_por_plan.get(p.cod_plan, []),
            }
            for p in planes
        ],
        historial=[{
            "cod_membresia": m.cod_membresia, "plan": m.cod_plan.nombre,
            "estado": m.cod_estado_membresia_id, "inicio": m.fecha_inicio.isoformat(),
            "fin": m.fecha_fin.isoformat(), "renovacion_automatica": m.renovacion_automatica,
        } for m in historial],
        pagos=[{
            "cod_pago": p.cod_pago_membresia, "monto": _money(p.monto), "fecha": _dt(p.fecha_pago),
            "cod_membresia": p.cod_membresia_id,
        } for p in PagoMembresia.objects.filter(cod_membresia__cod_usuario=request.user).order_by("-fecha_pago")],
    )


@login_required(login_url="/login/")
@require_POST
def api_activar_membresia(request):
    # Fase 3: Prime ya no se activa con botón directo.
    # Debe pagarse en /prime/checkout/<cod_plan>/ para registrar pago_membresia.
    return _json_error("La membresía Prime debe comprarse desde la pasarela de pago.", status=409)


@login_required(login_url="/login/")
@require_POST
def api_cancelar_membresia(request):
    membresia = MembresiaUsuario.objects.filter(cod_usuario=request.user, cod_estado_membresia_id="ACTIVA").order_by("-fecha_creacion").first()
    if not membresia:
        return _json_error("No tienes una membresía activa para cancelar.", status=409)
    try:
        cancelar_membresia_usuario(membresia.cod_membresia)
        return _json_ok(mensaje="Membresía cancelada. El historial de pagos se conserva.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


def _membresia_prime_activa(user):
    return MembresiaUsuario.objects.filter(cod_usuario=user, cod_estado_membresia_id="ACTIVA", fecha_fin__gte=timezone.localdate()).exists()


@login_required(login_url="/login/")
@require_GET
def api_compras_recurrentes(request):
    compras = CompraRecurrente.objects.filter(cod_usuario=request.user).order_by("-fecha_creacion")
    detalles = {}
    for item in CompraRecurrenteDetalle.objects.filter(cod_compra_recurrente__cod_usuario=request.user).select_related("cod_producto"):
        detalles.setdefault(item.cod_compra_recurrente_id, []).append({
            "cod_producto": item.cod_producto_id, "producto": item.cod_producto.nombre,
            "cantidad": item.cantidad, "precio": _money(item.cod_producto.precio_actual),
        })
    return _json_ok(
        habilitado=_membresia_prime_activa(request.user),
        compras=[{
            "cod_compra": c.cod_compra_recurrente, "nombre": c.nombre,
            "frecuencia_dias": c.frecuencia_dias, "proxima_ejecucion": c.proxima_ejecucion.isoformat(),
            "activa": c.activa, "productos": detalles.get(c.cod_compra_recurrente, []),
        } for c in compras],
    )


@login_required(login_url="/login/")
@require_POST
def api_crear_compra_recurrente(request):
    if not _membresia_prime_activa(request.user):
        return _json_error("Esta función requiere una membresía Prime activa.", status=403)
    try:
        frecuencia = int(request.POST.get("frecuencia_dias") or 0)
        proxima = parse_date(request.POST.get("proxima_ejecucion") or "")
        if frecuencia < 1 or not proxima or proxima < timezone.localdate():
            raise ValueError("Frecuencia o próxima ejecución inválida.")
        ident = crear_compra_recurrente(request.user.pk, request.POST.get("nombre") or "Compra recurrente", frecuencia, proxima)
        return _json_ok(cod_compra=ident, mensaje="Compra recurrente creada.")
    except (TypeError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_actualizar_compra_recurrente(request, cod_compra):
    compra = CompraRecurrente.objects.filter(pk=cod_compra, cod_usuario=request.user).first()
    if not compra:
        return _json_error("Compra recurrente no encontrada.", status=404)
    try:
        frecuencia = int(request.POST.get("frecuencia_dias") or compra.frecuencia_dias)
        proxima = parse_date(request.POST.get("proxima_ejecucion") or "") or compra.proxima_ejecucion
        activa = request.POST.get("activa", "1").lower() in {"1", "true", "on", "si", "sí"}
        actualizar_compra_recurrente(cod_compra, request.POST.get("nombre") or compra.nombre, frecuencia, proxima, activa)
        return _json_ok(mensaje="Compra recurrente actualizada.")
    except (TypeError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_producto_compra_recurrente(request, cod_compra):
    if not _membresia_prime_activa(request.user):
        return _json_error("Esta función requiere una membresía Prime activa.", status=403)
    compra = CompraRecurrente.objects.filter(pk=cod_compra, cod_usuario=request.user, activa=True).first()
    if not compra:
        return _json_error("Compra recurrente no encontrada o pausada.", status=404)
    try:
        cod_producto = int(request.POST.get("cod_producto") or 0)
        cantidad = int(request.POST.get("cantidad") or 0)
        if cantidad < 1 or not Producto.objects.filter(pk=cod_producto, cod_estado_producto_id="PUBLICADO").exists():
            raise ValueError("Producto o cantidad inválidos.")
        agregar_producto_compra_recurrente(cod_compra, cod_producto, cantidad)
        return _json_ok(mensaje="Producto agregado a la compra recurrente.")
    except (TypeError, ValueError) as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_ejecutar_compra_recurrente(request, cod_compra):
    if not _membresia_prime_activa(request.user):
        return _json_error("Esta función requiere una membresía Prime activa.", status=403)
    compra = CompraRecurrente.objects.filter(pk=cod_compra, cod_usuario=request.user, activa=True).first()
    if not compra:
        return _json_error("Compra recurrente no encontrada o pausada.", status=404)
    if not CompraRecurrenteDetalle.objects.filter(cod_compra_recurrente=compra).exists():
        return _json_error("Agrega al menos un producto antes de ejecutarla.", status=409)
    try:
        carrito = preparar_carrito_compra_recurrente(cod_compra)
        return _json_ok(cod_carrito=carrito, mensaje="Carrito preparado. Revisa stock, límites y pago antes de confirmar.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=409)
