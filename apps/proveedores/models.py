<<<<<<< HEAD
# Modelos Django mapeados desde una base PostgreSQL existente.
# Proyecto: TechTail
# Importante:
# - No renombrar db_table ni db_column.
# - managed = False porque la estructura la controlan los archivos SQL.
# - Las tablas con llave primaria compuesta usan models.CompositePrimaryKey.
# - Requiere Django 5.2 o superior para CompositePrimaryKey.

from django.db import models


=======
# Modelos Django mapeados desde una base PostgreSQL existente.
# Proyecto: TechTail
# Importante:
# - No renombrar db_table ni db_column.
# - managed = False porque la estructura la controlan los archivos SQL.
# - Las tablas con llave primaria compuesta usan models.CompositePrimaryKey.
# - Requiere Django 5.2 o superior para CompositePrimaryKey.

from django.db import models


>>>>>>> recovery/frontend-2026-08-04
class Proveedor(models.Model):
    cod_proveedor = models.BigAutoField(primary_key=True)
    ruc = models.CharField(unique=True, max_length=40)
    razon_social = models.CharField(max_length=180)
    nombre_comercial = models.CharField(max_length=180, blank=True, null=True)
    email = models.CharField(max_length=180)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    direccion = models.TextField(blank=True, null=True)
    ciudad = models.CharField(max_length=120, blank=True, null=True)
    provincia = models.CharField(max_length=120, blank=True, null=True)
    calificacion = models.DecimalField(max_digits=3, decimal_places=2)
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'proveedor'


class UsuarioProveedor(models.Model):
    cod_usuario_proveedor = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_proveedor = models.ForeignKey('proveedores.Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'usuario_proveedor'
        unique_together = (('cod_usuario', 'cod_proveedor'),)

class ProveedorContacto(models.Model):
    # Un proveedor puede tener varios contactos; PostgreSQL solo permite un contacto principal por índice parcial.
    cod_contacto = models.BigAutoField(primary_key=True)
    cod_proveedor = models.ForeignKey('proveedores.Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    nombre = models.CharField(max_length=160)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=180, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    principal = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'proveedor_contacto'

class ProductoProveedor(models.Model):
    cod_producto_proveedor = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_proveedor = models.ForeignKey('proveedores.Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    sku_proveedor = models.CharField(max_length=100)
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    precio_sugerido = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    tiempo_entrega_dias = models.IntegerField()
    prioridad = models.IntegerField()
    pedido_minimo = models.IntegerField()
    pedido_maximo = models.IntegerField(blank=True, null=True)
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_proveedor'
        unique_together = (('cod_producto', 'cod_proveedor'),)

class ProveedorStock(models.Model):
    cod_proveedor_stock = models.BigAutoField(primary_key=True)
    cod_producto_proveedor = models.OneToOneField('proveedores.ProductoProveedor', models.DO_NOTHING, db_column='cod_producto_proveedor')
    cantidad_disponible = models.IntegerField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'proveedor_stock'

class OrdenAbastecimiento(models.Model):
    cod_orden_abastecimiento = models.BigAutoField(primary_key=True)
    cod_proveedor = models.ForeignKey('proveedores.Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    cod_almacen = models.ForeignKey('administracion.Almacen', models.DO_NOTHING, db_column='cod_almacen', blank=True, null=True)
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido', blank=True, null=True)
    estado = models.CharField(max_length=30)
    total_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'orden_abastecimiento'

class OrdenAbastecimientoDetalle(models.Model):
    cod_orden_abastecimiento_detalle = models.BigAutoField(primary_key=True)
    cod_orden_abastecimiento = models.ForeignKey('proveedores.OrdenAbastecimiento', models.DO_NOTHING, db_column='cod_orden_abastecimiento')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orden_abastecimiento_detalle'

class HistorialProveedor(models.Model):
    cod_historial = models.BigAutoField(primary_key=True)
    cod_proveedor = models.ForeignKey('proveedores.Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    evento = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, null=True)
    fecha_evento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'historial_proveedor'
