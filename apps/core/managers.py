from django.contrib.auth.models import BaseUserManager
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El usuario debe tener un correo electrónico.")

        email = self.normalize_email(email)

        extra_fields.setdefault("nombres", "")
        extra_fields.setdefault("apellidos", "")
        extra_fields.setdefault("email_verificado", False)
        extra_fields.setdefault("activo", True)
        extra_fields.setdefault("fecha_creacion", timezone.now())
        extra_fields.setdefault("fecha_actualizacion", timezone.now())

        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("email_verificado", True)
        extra_fields.setdefault("activo", True)

        user = self.create_user(email, password, **extra_fields)
        self._asignar_rol_admin(user)

        return user

    def _asignar_rol_admin(self, user):
        from django.apps import apps

        Rol = apps.get_model("core", "Rol")
        UsuarioRol = apps.get_model("core", "UsuarioRol")

        rol_admin = Rol.objects.filter(nombre="ADMIN", activo=True).first()

        if rol_admin:
            UsuarioRol.objects.get_or_create(
                cod_usuario=user,
                cod_rol=rol_admin,
                defaults={"fecha_asignacion": timezone.now()},
            )