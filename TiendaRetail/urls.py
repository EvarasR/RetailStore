from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    # Admin nativo de Django. Déjalo solo para soporte técnico/desarrollo.
    path("admin/", admin.site.urls),

    # Interfaz propia del proyecto.
    path("", include("apps.clientes.urls")),
    path("", include("apps.core.urls")),
    path("panel/", include("apps.administracion.urls")),
    path("proveedores/", include("apps.proveedores.urls")),
    path("operaciones/", include("apps.operaciones.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
