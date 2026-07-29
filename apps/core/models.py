# Modelos Django mapeados desde una base PostgreSQL existente.
# Proyecto: Retail Prime
# Importante:
# - No renombrar db_table ni db_column.
# - managed = False porque la estructura la controlan los archivos SQL.
# - Las tablas con llave primaria compuesta usan models.CompositePrimaryKey.
# - Requiere Django 5.2 o superior para CompositePrimaryKey.

from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from .managers import UsuarioManager
from django.db import models




class Rol(models.Model):
    cod_rol = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=60)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'rol'

class Permiso(models.Model):
    cod_permiso = models.BigAutoField(primary_key=True)
    codigo = models.CharField(unique=True, max_length=100)
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'permiso'

class RolPermiso(models.Model):
    pk = models.CompositePrimaryKey('cod_rol', 'cod_permiso')
    cod_rol = models.ForeignKey('core.Rol', models.DO_NOTHING, db_column='cod_rol')
    cod_permiso = models.ForeignKey('core.Permiso', models.DO_NOTHING, db_column='cod_permiso')

    class Meta:
        managed = False
        db_table = 'rol_permiso'

class Usuario(AbstractBaseUser):
    cod_usuario = models.BigAutoField(primary_key=True)
    email = models.CharField(unique=True, max_length=180)

    # Django usará este campo como password,
    # pero realmente apunta a la columna password_hash.
    password = models.TextField(db_column="password_hash")

    nombres = models.CharField(max_length=120)
    apellidos = models.CharField(max_length=120)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    documento_identidad = models.CharField(unique=True, max_length=40, blank=True, null=True)
    email_verificado = models.BooleanField(default=False)
    activo = models.BooleanField(default=True)
    fecha_creacion = models.DateTimeField(default=timezone.now)
    fecha_actualizacion = models.DateTimeField(default=timezone.now)

    # Django espera last_login.
    # La columna real en PostgreSQL es ultimo_login.
    last_login = models.DateTimeField(db_column="ultimo_login", blank=True, null=True)

    objects = UsuarioManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"
    REQUIRED_FIELDS = ["nombres", "apellidos"]

    class Meta:
        managed = False
        db_table = "usuario"

    def __str__(self):
        return self.email

    @property
    def is_active(self):
        return self.activo

    @property
    def is_staff(self):
        return UsuarioRol.objects.filter(
            cod_usuario=self.cod_usuario,
            cod_rol__nombre="ADMIN",
            cod_rol__activo=True,
        ).exists()

    @property
    def is_superuser(self):
        return self.is_staff

    def has_perm(self, perm, obj=None):
        if self.is_superuser:
            return True

        roles_usuario = UsuarioRol.objects.filter(
            cod_usuario=self.cod_usuario
        ).values("cod_rol")

        return RolPermiso.objects.filter(
            cod_rol__in=roles_usuario,
            cod_permiso__codigo=perm,
            cod_permiso__activo=True,
        ).exists()

    def has_module_perms(self, app_label):
        return self.is_staff

    def get_full_name(self):
        return f"{self.nombres} {self.apellidos}".strip()

    def get_short_name(self):
        return self.nombres or self.email

class UsuarioRol(models.Model):
    pk = models.CompositePrimaryKey('cod_usuario', 'cod_rol')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_rol = models.ForeignKey('core.Rol', models.DO_NOTHING, db_column='cod_rol')
    fecha_asignacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'usuario_rol'

class PerfilUsuario(models.Model):
    cod_perfil = models.BigAutoField(primary_key=True)
    cod_usuario = models.OneToOneField('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    acepta_marketing = models.BooleanField()
    idioma_preferido = models.CharField(max_length=10)
    moneda_preferida = models.CharField(max_length=10)
    metadata = models.JSONField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'perfil_usuario'

class DireccionUsuario(models.Model):
    # Un usuario puede tener varias direcciones; PostgreSQL solo permite una predeterminada por índice parcial.
    cod_direccion = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    alias = models.CharField(max_length=80)
    receptor = models.CharField(max_length=180)
    linea1 = models.CharField(max_length=200)
    linea2 = models.CharField(max_length=200, blank=True, null=True)
    ciudad = models.CharField(max_length=120)
    provincia = models.CharField(max_length=120)
    pais = models.CharField(max_length=80)
    codigo_postal = models.CharField(max_length=20, blank=True, null=True)
    telefono_contacto = models.CharField(max_length=30, blank=True, null=True)
    es_predeterminada = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'direccion_usuario'


class Provincia(models.Model):
    cod_provincia = models.IntegerField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    activo = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'provincia'

    def __str__(self):
        return self.nombre


class Canton(models.Model):
    cod_canton = models.BigAutoField(primary_key=True)
    cod_provincia = models.ForeignKey('core.Provincia', models.DO_NOTHING, db_column='cod_provincia')
    nombre = models.CharField(max_length=120)
    activo = models.BooleanField(default=True)

    class Meta:
        managed = False
        db_table = 'canton'
        unique_together = (('cod_provincia', 'nombre'),)

    def __str__(self):
        return f"{self.nombre}, {self.cod_provincia.nombre}"

class IntentoLogin(models.Model):
    cod_intento = models.BigAutoField(primary_key=True)
    email = models.CharField(max_length=180)
    ip_origen = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, null=True)
    exitoso = models.BooleanField()
    motivo = models.TextField(blank=True, null=True)
    fecha_intento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'intento_login'

class Auditoria(models.Model):
    cod_auditoria = models.BigAutoField(primary_key=True)
    tabla = models.CharField(max_length=120)
    operacion = models.CharField(max_length=20)
    cod_registro = models.TextField(blank=True, null=True)
    usuario_bd = models.TextField()
    datos_anteriores = models.JSONField(blank=True, null=True)
    datos_nuevos = models.JSONField(blank=True, null=True)
    fecha_evento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'auditoria'

class ParametroSistema(models.Model):
    clave = models.CharField(primary_key=True, max_length=120)
    valor = models.TextField()
    descripcion = models.TextField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'parametro_sistema'

class EstadoProducto(models.Model):
    cod_estado_producto = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'estado_producto'

class EstadoPedido(models.Model):
    cod_estado_pedido = models.CharField(primary_key=True, max_length=40)
    nombre = models.CharField(max_length=100)
    orden = models.IntegerField(unique=True)
    genera_tracking = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'estado_pedido'

class EstadoPago(models.Model):
    cod_estado_pago = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)

    class Meta:
        managed = False
        db_table = 'estado_pago'

class EstadoMembresia(models.Model):
    cod_estado_membresia = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)

    class Meta:
        managed = False
        db_table = 'estado_membresia'

class TipoMovimientoInventario(models.Model):
    cod_tipo_movimiento = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)
    signo = models.SmallIntegerField()

    class Meta:
        managed = False
        db_table = 'tipo_movimiento_inventario'

class TipoEventoTracking(models.Model):
    cod_tipo_evento = models.CharField(primary_key=True, max_length=40)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tipo_evento_tracking'
