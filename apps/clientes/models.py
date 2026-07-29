# Modelos Django mapeados desde una base PostgreSQL existente.
# Proyecto: Retail Prime
# Importante:
# - No renombrar db_table ni db_column.
# - managed = False porque la estructura la controlan los archivos SQL.
# - Las tablas con llave primaria compuesta usan models.CompositePrimaryKey.
# - Requiere Django 5.2 o superior para CompositePrimaryKey.

from django.db import models


class Carrito(models.Model):
    # Un usuario puede tener historial de carritos; PostgreSQL solo permite un carrito ACTIVO por índice parcial.
    cod_carrito = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    estado = models.CharField(max_length=30)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'carrito'

class CarritoDetalle(models.Model):
    cod_carrito_detalle = models.BigAutoField(primary_key=True)
    cod_carrito = models.ForeignKey('clientes.Carrito', models.DO_NOTHING, db_column='cod_carrito')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()
    precio_unitario_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'carrito_detalle'
        unique_together = (('cod_carrito', 'cod_producto'),)

class ProductoFavorito(models.Model):
    pk = models.CompositePrimaryKey('cod_usuario', 'cod_producto')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_favorito'

class Wishlist(models.Model):
    # Un usuario puede tener varias listas; PostgreSQL solo permite una predeterminada por índice parcial.
    cod_wishlist = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    nombre = models.CharField(max_length=120)
    es_predeterminada = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wishlist'
        unique_together = (('cod_usuario', 'nombre'),)

class WishlistDetalle(models.Model):
    pk = models.CompositePrimaryKey('cod_wishlist', 'cod_producto')
    cod_wishlist = models.ForeignKey('clientes.Wishlist', models.DO_NOTHING, db_column='cod_wishlist')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    fecha_agregado = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wishlist_detalle'

class ProductoPregunta(models.Model):
    cod_pregunta = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    pregunta = models.TextField()
    estado = models.CharField(max_length=30)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_pregunta'

class ProductoRespuesta(models.Model):
    cod_respuesta = models.BigAutoField(primary_key=True)
    cod_pregunta = models.OneToOneField('clientes.ProductoPregunta', models.DO_NOTHING, db_column='cod_pregunta')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    respuesta = models.TextField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_respuesta'

class PlanMembresia(models.Model):
    cod_plan = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    precio_mensual = models.DecimalField(max_digits=12, decimal_places=2)
    duracion_dias = models.IntegerField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'plan_membresia'

class BeneficioMembresia(models.Model):
    cod_beneficio = models.BigAutoField(primary_key=True)
    cod_plan = models.ForeignKey('clientes.PlanMembresia', models.DO_NOTHING, db_column='cod_plan')
    codigo = models.CharField(max_length=80)
    nombre = models.CharField(max_length=120)
    valor = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'beneficio_membresia'
        unique_together = (('cod_plan', 'codigo'),)

class MembresiaUsuario(models.Model):
    cod_membresia = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_plan = models.ForeignKey('clientes.PlanMembresia', models.DO_NOTHING, db_column='cod_plan')
    cod_estado_membresia = models.ForeignKey('core.EstadoMembresia', models.DO_NOTHING, db_column='cod_estado_membresia')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    renovacion_automatica = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'membresia_usuario'

class PagoMembresia(models.Model):
    cod_pago_membresia = models.BigAutoField(primary_key=True)
    cod_membresia = models.ForeignKey('clientes.MembresiaUsuario', models.DO_NOTHING, db_column='cod_membresia')
    cod_transaccion = models.ForeignKey('operaciones.TransaccionPago', models.DO_NOTHING, db_column='cod_transaccion', blank=True, null=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_pago = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pago_membresia'

class CompraRecurrente(models.Model):
    cod_compra_recurrente = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    nombre = models.CharField(max_length=120)
    frecuencia_dias = models.IntegerField()
    proxima_ejecucion = models.DateField()
    activa = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'compra_recurrente'

class CompraRecurrenteDetalle(models.Model):
    cod_compra_recurrente_detalle = models.BigAutoField(primary_key=True)
    cod_compra_recurrente = models.ForeignKey('clientes.CompraRecurrente', models.DO_NOTHING, db_column='cod_compra_recurrente')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'compra_recurrente_detalle'
        unique_together = (('cod_compra_recurrente', 'cod_producto'),)

class UsoBeneficio(models.Model):
    cod_uso_beneficio = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_beneficio = models.ForeignKey('clientes.BeneficioMembresia', models.DO_NOTHING, db_column='cod_beneficio')
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido', blank=True, null=True)
    valor_aplicado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_uso = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'uso_beneficio'

class ContenidoDigital(models.Model):
    cod_contenido = models.BigAutoField(primary_key=True)
    titulo = models.CharField(max_length=180)
    tipo = models.CharField(max_length=40)
    descripcion = models.TextField(blank=True, null=True)
    url_contenido = models.TextField()
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto', blank=True, null=True)
    requiere_premium = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'contenido_digital'

class BibliotecaUsuario(models.Model):
    cod_biblioteca = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_contenido = models.ForeignKey('clientes.ContenidoDigital', models.DO_NOTHING, db_column='cod_contenido')
    fecha_agregado = models.DateTimeField()
    fecha_expiracion = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'biblioteca_usuario'
        unique_together = (('cod_usuario', 'cod_contenido'),)
