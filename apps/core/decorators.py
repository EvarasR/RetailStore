"""Decoradores de autorización reutilizables para APIs internas."""

from functools import wraps

from django.conf import settings
from django.http import JsonResponse


def _error(mensaje, status):
    return JsonResponse({"ok": False, "mensaje": mensaje}, status=status)


def admin_required_api(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return _error("Debes iniciar sesión.", 401)
        if not getattr(request.user, "is_staff", False):
            return _error("No tienes permisos para esta operación.", 403)
        return view(request, *args, **kwargs)
    return wrapped


def api_login_required(view):
    @wraps(view)
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return _error("Debes iniciar sesión.", 401)
        return view(request, *args, **kwargs)
    return wrapped
