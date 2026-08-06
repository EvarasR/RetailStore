import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TiendaRetail.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.core.views import _build_session_response
from django.test import RequestFactory

User = get_user_model()
factory = RequestFactory()

def print_session(user=None):
    request = factory.get('/api/session/')
    if user:
        request.user = user
    else:
        from django.contrib.auth.models import AnonymousUser
        request.user = AnonymousUser()
        
    response_data = _build_session_response(request)
    print(f"--- Session for {user.email if user else 'Anonymous'} ---")
    print(json.dumps(json.loads(response_data.content.decode('utf-8')), indent=2))

# 1. Anonymous
print_session(None)

from apps.core.models import UsuarioRol

# 2. CUSTOMER
try:
    ur = UsuarioRol.objects.filter(cod_rol__nombre__in=['CUSTOMER', 'PREMIUM_CUSTOMER']).first()
    if ur:
        print_session(ur.cod_usuario)
except Exception as e:
    print(f"Error CUSTOMER: {e}")

# 3. SUPPLIER_MANAGER sin asociacion
try:
    ur = UsuarioRol.objects.filter(cod_rol__nombre='SUPPLIER_MANAGER').first()
    if ur:
        s_manager = ur.cod_usuario
        from apps.proveedores.models import UsuarioProveedor
        UsuarioProveedor.objects.filter(cod_usuario=s_manager).delete()
        print_session(s_manager)
except Exception as e:
    print(f"Error SUPPLIER_MANAGER: {e}")

# 4. Proveedor externo asociado
try:
    from apps.proveedores.models import Proveedor, UsuarioProveedor
    from apps.core.models import Rol, UsuarioRol
    from django.contrib.auth import get_user_model
    from django.utils import timezone
    User = get_user_model()
    prov_user = User.objects.filter(email='proveedor_test@example.com').first()
    if not prov_user:
        prov_user = User.objects.create(email='proveedor_test@example.com', nombres='Prov', apellidos='Test')
    
    rol_prov, _ = Rol.objects.get_or_create(nombre='PROVEEDOR', defaults={'descripcion': 'Proveedor', 'activo': True, 'fecha_creacion': timezone.now()})
    UsuarioRol.objects.get_or_create(cod_usuario=prov_user, cod_rol=rol_prov, defaults={'fecha_asignacion': timezone.now()})

    prov = Proveedor.objects.first()
    if prov:
        UsuarioProveedor.objects.get_or_create(cod_usuario=prov_user, cod_proveedor=prov, defaults={'activo': True, 'fecha_creacion': timezone.now(), 'fecha_actualizacion': timezone.now()})
        print_session(prov_user)
except Exception as e:
    print(f"Error PROVEEDOR: {e}")

# 5. ADMIN sin asociacion
try:
    ur = UsuarioRol.objects.filter(cod_rol__nombre='ADMIN').first()
    if ur:
        print_session(ur.cod_usuario)
except Exception as e:
    print(f"Error ADMIN: {e}")


