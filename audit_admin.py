import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TiendaRetail.settings')
django.setup()

from apps.core.models import Usuario, Rol, UsuarioRol

u = Usuario.objects.filter(email__iexact='admin@retailprime.local').first()
if u:
    print("Usuario existe: SÍ")
    print(f"Activo: {'SÍ' if u.activo else 'NO'}")
    print(f"Hash presente: {'SÍ' if u.password else 'NO'}")
    roles = UsuarioRol.objects.filter(cod_usuario=u).values_list('cod_rol__nombre', flat=True)
    print(f"Roles asociados: {list(roles)}")
    print(f"Rol ADMIN: {'SÍ' if 'ADMIN' in roles else 'NO'}")
else:
    print("Usuario existe: NO")
