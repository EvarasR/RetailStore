from urllib.parse import urlparse

from django.conf import settings
from django.contrib import messages
from django.contrib.auth import authenticate, login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseForbidden
from django.views.csrf import csrf_failure as default_csrf_failure

def csrf_failure(request, reason=""):
    if request.path.startswith("/api/") or request.headers.get("x-requested-with") == "fetch":
        return JsonResponse(
            {
                "ok": False,
                "mensaje": "No se pudo validar la sesión de seguridad. Recarga el formulario e inténtalo nuevamente.",
                "razon": reason
            },
            status=403
        )
    return default_csrf_failure(request, reason=reason)

from django.shortcuts import redirect, render
from django.utils import timezone
from django.utils.http import url_has_allowed_host_and_scheme
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.debug import sensitive_post_parameters
from django.views.decorators.http import require_GET, require_POST

from apps.core.models import Canton, DireccionUsuario, PerfilUsuario, Provincia, UsuarioRol
from apps.core.services.usuario_service import (
    actualizar_direccion_usuario,
    cambiar_password_usuario,
    crear_direccion_usuario,
    crear_usuario_cliente,
    eliminar_direccion_usuario,
    verificar_email_usuario,
)


def _json_error(mensaje, status=400, **extra):
    data = {"ok": False, "mensaje": mensaje}
    data.update(extra)
    return JsonResponse(data, status=status)


def _safe_error(exc, mensaje="No se pudo completar la operación."):
    return str(exc) if settings.DEBUG else mensaje


def _json_ok(**data):
    payload = {"ok": True}
    payload.update(data)
    return JsonResponse(payload)


def _is_admin(user):
    return user.is_authenticated and getattr(user, "is_staff", False)


def _roles_usuario(user):
    if not user.is_authenticated:
        return set()
    return set(UsuarioRol.objects.filter(cod_usuario=user, cod_rol__activo=True).values_list("cod_rol__nombre", flat=True))


def _destino_por_rol(user):
    if _is_admin(user):
        return "administracion:panel"
    if _roles_usuario(user).intersection({"WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT"}):
        return "administracion:panel"
    # El portal proveedor sólo se habilita con la relación explícita vigente.
    try:
        from apps.proveedores.services.portal_service import es_usuario_proveedor, obtener_proveedor_usuario
        if es_usuario_proveedor(user) and obtener_proveedor_usuario(user):
            return "proveedores:panel"
    except Exception:
        # No se filtra detalle interno durante una falla de autorización.
        pass
    return "clientes:inicio"


def _redirect_seguro_por_rol(request, user, next_url=None):
    destino_rol = _destino_por_rol(user)

    if not next_url or not url_has_allowed_host_and_scheme(
        url=next_url,
        allowed_hosts={request.get_host()},
        require_https=request.is_secure(),
    ):
        return redirect(destino_rol)

    path = urlparse(next_url).path or "/"
    es_ruta_admin = path.startswith("/panel/") or path == "/panel/" or path.startswith("/admin/")

    if _is_admin(user) or _roles_usuario(user).intersection({"WAREHOUSE_MANAGER", "SUPPLIER_MANAGER", "SUPPORT"}):
        return redirect(next_url if es_ruta_admin else destino_rol)

    if es_ruta_admin:
        return redirect(destino_rol)

    return redirect(next_url)


@ensure_csrf_cookie
@sensitive_post_parameters("password")
def login_view(request):
    if request.user.is_authenticated:
        return _redirect_seguro_por_rol(request, request.user, request.GET.get("next"))

    if request.method == "POST":
        email = (request.POST.get("email") or "").strip().lower()
        password = request.POST.get("password") or ""
        next_url = request.GET.get("next") or request.POST.get("next")

        mensaje_login_generado = False
        try:
            user = authenticate(request, username=email, password=password)
        except ValueError:
            user = None
            mensaje_login_generado = True
            if settings.DEBUG:
                messages.error(
                    request,
                    "El hash almacenado en password_hash no tiene formato Django válido. "
                    "Ejecuta sql_fix_passwords_demo.sql o vuelve a cargar funciones.sql y datos.sql.",
                )
            else:
                messages.error(request, "No se pudo validar el acceso en este momento.")

        if user is not None:
            login(request, user)
            return _redirect_seguro_por_rol(request, user, next_url)

        if not mensaje_login_generado:
            messages.error(request, "Correo o contraseña incorrectos.")

    return render(request, "core/login.html", {"next": request.GET.get("next", "")})


@ensure_csrf_cookie
@sensitive_post_parameters("password", "password2")
def registro_view(request):
    if request.user.is_authenticated:
        return _redirect_seguro_por_rol(request, request.user)

    if request.method == "POST":
        email = (request.POST.get("email") or "").strip().lower()
        nombres = (request.POST.get("nombres") or "").strip()
        apellidos = (request.POST.get("apellidos") or "").strip()
        telefono = (request.POST.get("telefono") or "").strip() or None
        documento = (request.POST.get("documento_identidad") or "").strip() or None
        password = request.POST.get("password") or ""
        password2 = request.POST.get("password2") or ""
        acepta = request.POST.get("acepta") == "on"

        if not acepta:
            messages.error(request, "Debes aceptar las condiciones de uso académico del sistema.")
        elif password != password2:
            messages.error(request, "Las contraseñas no coinciden.")
        elif len(password) < 8:
            messages.error(request, "La contraseña debe tener al menos 8 caracteres.")
        else:
            try:
                crear_usuario_cliente(email, password, nombres, apellidos, telefono, documento)
                user = authenticate(request, username=email, password=password)
                if user is not None:
                    login(request, user)
                    messages.success(request, "Cuenta creada correctamente. Bienvenido a TechTail.")
                    return redirect("clientes:inicio")
                messages.success(request, "Cuenta creada. Ahora inicia sesión.")
                return redirect("core:login")
            except Exception as exc:
                messages.error(request, _safe_error(exc, "No se pudo crear la cuenta."))

    return render(request, "core/registro.html")


@login_required(login_url="/login/")
@require_POST
def logout_view(request):
    logout(request)
    return redirect("clientes:inicio")


@login_required(login_url="/login/")
@ensure_csrf_cookie
def perfil_view(request):
    return render(request, "core/perfil.html")


@require_GET
@ensure_csrf_cookie
def api_csrf(request):
    return _json_ok(mensaje="Cookie CSRF establecida correctamente.")


def _build_session_response(request, mensaje=None):
    user = request.user
    if not user.is_authenticated:
        data = {
            "ok": True,
            "autenticado": False,
            "usuario": None,
            "es_admin": False,
            "es_prime": False,
            "es_proveedor_externo": False,
            "cod_proveedor": None,
            "roles": [],
        }
        if mensaje:
            data["mensaje"] = mensaje
        return _json_ok(**data)

    es_prime = False
    try:
        from apps.clientes.models import MembresiaUsuario
        es_prime = MembresiaUsuario.objects.filter(cod_usuario=user, cod_estado_membresia_id="ACTIVA").exists()
    except Exception:
        es_prime = False

    es_proveedor_externo = False
    cod_proveedor = None
    try:
        from apps.proveedores.services.portal_service import es_usuario_proveedor, obtener_proveedor_usuario
        if es_usuario_proveedor(user):
            proveedor = obtener_proveedor_usuario(user)
            if proveedor:
                es_proveedor_externo = True
                cod_proveedor = proveedor.cod_proveedor
    except Exception:
        pass

    usuario_data = {
        "id": user.cod_usuario,
        "cod_usuario": user.cod_usuario,
        "email": user.email,
        "nombre": user.get_full_name() or user.nombres or user.email,
        "nombres": user.nombres,
        "apellidos": user.apellidos,
        "nombre_completo": user.get_full_name(),
    }
    data = {
        "ok": True,
        "autenticado": True,
        "es_admin": _is_admin(user),
        "es_prime": es_prime,
        "es_proveedor_externo": es_proveedor_externo,
        "cod_proveedor": cod_proveedor,
        "roles": sorted(_roles_usuario(user)),
        "usuario": usuario_data,
    }
    if mensaje:
        data["mensaje"] = mensaje
    return _json_ok(**data)


@require_GET
@ensure_csrf_cookie
def api_session(request):
    return _build_session_response(request)


def _get_request_data(request):
    import json
    if request.content_type and "application/json" in request.content_type:
        try:
            return json.loads(request.body.decode("utf-8"))
        except Exception:
            return {}
    if request.POST:
        return request.POST
    return {}


@require_POST
@ensure_csrf_cookie
@sensitive_post_parameters("password", "contraseña", "clave")
def api_auth_login(request):
    data = _get_request_data(request)
    email = (
        data.get("email")
        or data.get("correo")
        or data.get("username")
        or data.get("usuario")
        or ""
    ).strip().lower()
    password = (
        data.get("password")
        or data.get("contraseña")
        or data.get("clave")
        or ""
    )
    if not email or not password:
        return _json_error("Credenciales incorrectas", status=401)
    try:
        user = authenticate(request, username=email, password=password)
        if user is None:
            user = authenticate(request, email=email, password=password)
    except Exception:
        user = None
    if user is not None:
        login(request, user)
        return _build_session_response(request, mensaje="Sesión iniciada correctamente")
    return _json_error("Credenciales incorrectas", status=401)


@require_POST
@ensure_csrf_cookie
@sensitive_post_parameters("password", "password2")
def api_auth_registro(request):
    data = _get_request_data(request)
    email = (data.get("email") or "").strip().lower()
    nombres = (data.get("nombres") or "").strip()
    apellidos = (data.get("apellidos") or "").strip()
    telefono = (data.get("telefono") or "").strip() or None
    documento = (data.get("documento_identidad") or "").strip() or None
    password = data.get("password") or ""
    password2 = data.get("password2") or ""
    acepta = data.get("acepta") in (True, "true", "on", 1, "1")

    if not acepta:
        return _json_error("Debes aceptar las condiciones de uso.", status=400)
    if password != password2:
        return _json_error("Las contraseñas no coinciden.", status=400)
    if len(password) < 8:
        return _json_error("La contraseña debe tener al menos 8 caracteres.", status=400)
    try:
        crear_usuario_cliente(email, password, nombres, apellidos, telefono, documento)
        user = authenticate(request, username=email, password=password)
        if user is None:
            user = authenticate(request, email=email, password=password)
        if user is not None:
            login(request, user)
        return _build_session_response(request, mensaje="Cuenta creada e iniciada correctamente")
    except Exception as exc:
        return _json_error(_safe_error(exc, "No se pudo crear la cuenta."), status=400)


@require_POST
@ensure_csrf_cookie
def api_auth_logout(request):
    logout(request)
    return _json_ok(
        mensaje="Sesión cerrada correctamente.",
        autenticado=False,
        usuario=None,
        es_admin=False,
        es_prime=False,
        es_proveedor_externo=False,
        cod_proveedor=None,
        roles=[],
    )


@login_required(login_url="/login/")
@require_GET
def api_perfil(request):
    user = request.user
    perfil = PerfilUsuario.objects.filter(cod_usuario=user).first()
    return _json_ok(
        usuario={
            "cod_usuario": user.cod_usuario,
            "email": user.email,
            "nombres": user.nombres,
            "apellidos": user.apellidos,
            "telefono": user.telefono,
            "documento_identidad": user.documento_identidad,
            "email_verificado": user.email_verificado,
            "activo": user.activo,
            "ultimo_login": user.last_login.isoformat() if user.last_login else None,
        },
        perfil={
            "acepta_marketing": getattr(perfil, "acepta_marketing", False),
            "idioma_preferido": getattr(perfil, "idioma_preferido", "es"),
            "moneda_preferida": getattr(perfil, "moneda_preferida", "USD"),
        },
    )


@login_required(login_url="/login/")
@sensitive_post_parameters("documento_identidad")
@require_POST
def api_actualizar_perfil(request):
    user = request.user
    user.nombres = (request.POST.get("nombres") or user.nombres).strip()
    user.apellidos = (request.POST.get("apellidos") or user.apellidos).strip()
    user.telefono = (request.POST.get("telefono") or "").strip() or None
    user.documento_identidad = (request.POST.get("documento_identidad") or "").strip() or None
    user.fecha_actualizacion = timezone.now()
    user.save(update_fields=["nombres", "apellidos", "telefono", "documento_identidad", "fecha_actualizacion"])
    return _json_ok(mensaje="Perfil actualizado.")


@require_GET
def api_ubicaciones(request):
    cod_provincia = request.GET.get("cod_provincia") or request.GET.get("provincia") or ""
    provincias = Provincia.objects.filter(activo=True).order_by("cod_provincia")

    cantones_qs = Canton.objects.filter(activo=True).select_related("cod_provincia").order_by("cod_provincia_id", "nombre")
    if cod_provincia:
        try:
            cantones_qs = cantones_qs.filter(cod_provincia_id=int(cod_provincia))
        except ValueError:
            cantones_qs = cantones_qs.none()

    return _json_ok(
        provincias=[
            {"cod_provincia": p.cod_provincia, "nombre": p.nombre}
            for p in provincias
        ],
        cantones=[
            {
                "cod_canton": c.cod_canton,
                "cod_provincia": c.cod_provincia_id,
                "provincia": c.cod_provincia.nombre,
                "nombre": c.nombre,
            }
            for c in cantones_qs
        ],
    )


def _resolver_ubicacion_desde_post(request):
    cod_provincia = request.POST.get("cod_provincia") or ""
    cod_canton = request.POST.get("cod_canton") or ""
    provincia_texto = (request.POST.get("provincia") or "").strip()
    ciudad_texto = (request.POST.get("ciudad") or "").strip()

    if cod_provincia and cod_canton:
        canton = Canton.objects.select_related("cod_provincia").filter(
            cod_canton=cod_canton,
            cod_provincia_id=cod_provincia,
            activo=True,
            cod_provincia__activo=True,
        ).first()
        if not canton:
            raise ValueError("Selecciona una provincia y cantón válidos.")
        return canton.cod_provincia.nombre, canton.nombre

    if not provincia_texto or not ciudad_texto:
        raise ValueError("Selecciona provincia y cantón.")

    canton = Canton.objects.select_related("cod_provincia").filter(
        nombre__iexact=ciudad_texto,
        cod_provincia__nombre__iexact=provincia_texto,
        activo=True,
        cod_provincia__activo=True,
    ).first()
    if not canton:
        raise ValueError("Provincia/cantón no existen en el catálogo de Ecuador.")
    return canton.cod_provincia.nombre, canton.nombre


@login_required(login_url="/login/")
@require_GET
def api_direcciones(request):
    direcciones = DireccionUsuario.objects.filter(cod_usuario=request.user, activo=True).order_by("-es_predeterminada", "alias")
    data = []
    for d in direcciones:
        canton = Canton.objects.select_related("cod_provincia").filter(
            nombre__iexact=d.ciudad,
            cod_provincia__nombre__iexact=d.provincia,
            activo=True,
        ).first()
        data.append({
            "cod_direccion": d.cod_direccion,
            "alias": d.alias,
            "receptor": d.receptor,
            "linea1": d.linea1,
            "linea2": d.linea2,
            "ciudad": d.ciudad,
            "provincia": d.provincia,
            "cod_provincia": canton.cod_provincia_id if canton else None,
            "cod_canton": canton.cod_canton if canton else None,
            "pais": d.pais,
            "codigo_postal": d.codigo_postal,
            "telefono_contacto": d.telefono_contacto,
            "es_predeterminada": d.es_predeterminada,
        })
    return _json_ok(direcciones=data)


@login_required(login_url="/login/")
@require_POST
def api_crear_direccion(request):
    try:
        provincia, ciudad = _resolver_ubicacion_desde_post(request)
        cod = crear_direccion_usuario(
            request.user.cod_usuario,
            request.POST.get("alias") or "Principal",
            request.POST.get("receptor") or request.user.get_full_name() or request.user.email,
            request.POST.get("linea1") or "",
            request.POST.get("linea2") or None,
            ciudad,
            provincia,
            request.POST.get("pais") or "Ecuador",
            request.POST.get("codigo_postal") or None,
            request.POST.get("telefono_contacto") or request.user.telefono,
            request.POST.get("es_predeterminada") in ("true", "on", "1"),
        )
        return _json_ok(mensaje="Dirección registrada.", cod_direccion=cod)
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_eliminar_direccion(request, cod_direccion):
    direccion = DireccionUsuario.objects.filter(cod_direccion=cod_direccion, cod_usuario=request.user).first()
    if not direccion:
        return _json_error("Dirección no encontrada.", status=404)
    try:
        eliminar_direccion_usuario(cod_direccion)
        return _json_ok(mensaje="Dirección eliminada.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_actualizar_direccion(request, cod_direccion):
    direccion = DireccionUsuario.objects.filter(cod_direccion=cod_direccion, cod_usuario=request.user, activo=True).first()
    if not direccion:
        return _json_error("DirecciÃ³n no encontrada.", status=404)
    try:
        provincia, ciudad = _resolver_ubicacion_desde_post(request)
        actualizar_direccion_usuario(
            cod_direccion,
            request.POST.get("alias") or direccion.alias,
            request.POST.get("receptor") or direccion.receptor,
            request.POST.get("linea1") or direccion.linea1,
            request.POST.get("linea2") if "linea2" in request.POST else direccion.linea2,
            ciudad, provincia, request.POST.get("pais") or direccion.pais,
            request.POST.get("codigo_postal") if "codigo_postal" in request.POST else direccion.codigo_postal,
            request.POST.get("telefono_contacto") if "telefono_contacto" in request.POST else direccion.telefono_contacto,
            request.POST.get("es_predeterminada") in ("true", "on", "1"),
        )
        return _json_ok(mensaje="DirecciÃ³n actualizada.")
    except ValueError as exc:
        return _json_error(str(exc), status=400)
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@sensitive_post_parameters("password_actual", "password_nueva", "password_confirmacion")
@require_POST
def api_cambiar_password(request):
    actual = request.POST.get("password_actual") or ""
    nueva = request.POST.get("password_nueva") or ""
    confirmacion = request.POST.get("password_confirmacion") or ""
    if not request.user.check_password(actual):
        return _json_error("La contraseÃ±a actual no es correcta.", status=400)
    if len(nueva) < 8:
        return _json_error("La nueva contraseÃ±a debe tener al menos 8 caracteres.", status=400)
    if nueva != confirmacion:
        return _json_error("La confirmaciÃ³n no coincide.", status=400)
    try:
        cambiar_password_usuario(request.user.pk, nueva)
        request.user.refresh_from_db(fields=["password"])
        update_session_auth_hash(request, request.user)
        return _json_ok(mensaje="ContraseÃ±a actualizada de forma segura.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)


@login_required(login_url="/login/")
@require_POST
def api_verificar_email(request):
    if request.user.email_verificado:
        return _json_ok(mensaje="Tu correo ya estÃ¡ verificado.")
    if request.POST.get("confirmar") not in ("1", "true", "on"):
        return _json_error("Confirma la verificaciÃ³n del correo.", status=400)
    try:
        verificar_email_usuario(request.user.pk)
        return _json_ok(mensaje="Correo verificado para este entorno de demostraciÃ³n.")
    except Exception as exc:
        return _json_error(_safe_error(exc), status=500)
