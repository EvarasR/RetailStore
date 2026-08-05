# Modelos Django mapeados desde una base PostgreSQL existente.
# Proyecto: TechTail
# Importante:
# - No renombrar db_table ni db_column.
# - managed = False porque la estructura la controlan los archivos SQL.
# - Las tablas con llave primaria compuesta usan models.CompositePrimaryKey.
# - Requiere Django 5.2 o superior para CompositePrimaryKey.

from django.db import models


class Categoria(models.Model):
    cod_categoria = models.BigAutoField(primary_key=True)
    cod_categoria_padre = models.ForeignKey('self', models.DO_NOTHING, db_column='cod_categoria_padre', blank=True, null=True)
    nombre = models.CharField(max_length=120)
    slug = models.CharField(unique=True, max_length=140)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'categoria'
        unique_together = (('cod_categoria_padre', 'nombre'),)

class Marca(models.Model):
    cod_marca = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'marca'

class Producto(models.Model):
    cod_producto = models.BigAutoField(primary_key=True)
    cod_categoria = models.ForeignKey('administracion.Categoria', models.DO_NOTHING, db_column='cod_categoria')
    cod_marca = models.ForeignKey('administracion.Marca', models.DO_NOTHING, db_column='cod_marca')
    sku = models.CharField(unique=True, max_length=80)
    nombre = models.CharField(max_length=180)
    descripcion = models.TextField()
    precio_actual = models.DecimalField(max_digits=12, decimal_places=2)
    peso_kg = models.DecimalField(max_digits=10, decimal_places=3)
    largo_cm = models.DecimalField(max_digits=10, decimal_places=2)
    ancho_cm = models.DecimalField(max_digits=10, decimal_places=2)
    alto_cm = models.DecimalField(max_digits=10, decimal_places=2)
    cod_estado_producto = models.ForeignKey('core.EstadoProducto', models.DO_NOTHING, db_column='cod_estado_producto')
    requiere_revision_mayorista = models.BooleanField()
    metadata = models.JSONField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto'

class ProductoImagen(models.Model):
    # Puede haber varias imágenes por producto; PostgreSQL solo garantiza una principal mediante índice único parcial.
    cod_imagen = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    url_imagen = models.TextField()
    alt_text = models.CharField(max_length=180, blank=True, null=True)
    es_principal = models.BooleanField()
    orden = models.IntegerField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_imagen'

class ProductoAtributo(models.Model):
    cod_atributo = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=100)
    tipo_dato = models.CharField(max_length=30)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'producto_atributo'

class ProductoAtributoValor(models.Model):
    pk = models.CompositePrimaryKey('cod_producto', 'cod_atributo')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_atributo = models.ForeignKey('administracion.ProductoAtributo', models.DO_NOTHING, db_column='cod_atributo')
    valor = models.TextField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'producto_atributo_valor'

class ProductoRelacionado(models.Model):
    pk = models.CompositePrimaryKey('cod_producto', 'cod_producto_relacionado')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_producto_relacionado = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto_relacionado', related_name='productorelacionado_cod_producto_relacionado_set')
    tipo_relacion = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'producto_relacionado'

class ProductoResena(models.Model):
    cod_resena = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    calificacion = models.SmallIntegerField()
    titulo = models.CharField(max_length=160, blank=True, null=True)
    comentario = models.TextField(blank=True, null=True)
    aprobado = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_resena'
        unique_together = (('cod_usuario', 'cod_producto'),)

class ReglaLimiteCompra(models.Model):
    # La unicidad de regla activa por producto/categoría está controlada por índices únicos parciales en PostgreSQL.
    cod_regla = models.BigAutoField(primary_key=True)
    cod_categoria = models.ForeignKey('administracion.Categoria', models.DO_NOTHING, db_column='cod_categoria', blank=True, null=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto', blank=True, null=True)
    limite_por_pedido = models.IntegerField()
    limite_por_dia = models.IntegerField(blank=True, null=True)
    limite_por_mes = models.IntegerField(blank=True, null=True)
    requiere_revision = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'regla_limite_compra'

class HistorialPrecioProducto(models.Model):
    cod_historial_precio = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    precio_anterior = models.DecimalField(max_digits=12, decimal_places=2)
    precio_nuevo = models.DecimalField(max_digits=12, decimal_places=2)
    motivo = models.TextField(blank=True, null=True)
    fecha_cambio = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'historial_precio_producto'


class ReglaPrecio(models.Model):
    cod_regla_precio = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto', blank=True, null=True)
    cod_categoria = models.ForeignKey('administracion.Categoria', models.DO_NOTHING, db_column='cod_categoria', blank=True, null=True)
    margen_porcentaje = models.DecimalField(max_digits=8, decimal_places=4)
    costo_operativo_porcentaje = models.DecimalField(max_digits=8, decimal_places=4)
    costo_fijo_unitario = models.DecimalField(max_digits=12, decimal_places=4)
    porcentaje_impuesto = models.DecimalField(max_digits=8, decimal_places=4, blank=True, null=True)
    prioridad = models.IntegerField()
    activo = models.BooleanField()
    fecha_inicio = models.DateTimeField(blank=True, null=True)
    fecha_fin = models.DateTimeField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'regla_precio'

class Almacen(models.Model):
    cod_almacen = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    direccion = models.TextField()
    ciudad = models.CharField(max_length=120)
    provincia = models.CharField(max_length=120)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'almacen'

class Inventario(models.Model):
    cod_inventario = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey('administracion.Almacen', models.DO_NOTHING, db_column='cod_almacen')
    stock_total = models.IntegerField()
    stock_reservado = models.IntegerField()
    stock_minimo = models.IntegerField()
    stock_maximo = models.IntegerField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'inventario'
        unique_together = (('cod_producto', 'cod_almacen'),)


class LoteInventario(models.Model):
    cod_lote = models.BigAutoField(primary_key=True)
    numero_lote = models.CharField(unique=True, max_length=80)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey('administracion.Almacen', models.DO_NOTHING, db_column='cod_almacen')
    cod_proveedor = models.ForeignKey('proveedores.Proveedor', models.DO_NOTHING, db_column='cod_proveedor', blank=True, null=True)
    cod_orden_abastecimiento_detalle = models.ForeignKey('proveedores.OrdenAbastecimientoDetalle', models.DO_NOTHING, db_column='cod_orden_abastecimiento_detalle', blank=True, null=True)
    cantidad_recibida = models.IntegerField()
    cantidad_disponible = models.IntegerField()
    cantidad_reservada = models.IntegerField()
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=4)
    margen_porcentaje_aplicado = models.DecimalField(max_digits=8, decimal_places=4)
    costo_operativo_aplicado = models.DecimalField(max_digits=8, decimal_places=4)
    porcentaje_impuesto_aplicado = models.DecimalField(max_digits=8, decimal_places=4)
    pvp_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_recepcion = models.DateTimeField()
    fecha_vencimiento = models.DateTimeField(blank=True, null=True)
    estado = models.CharField(max_length=20)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'lote_inventario'

class MovimientoInventario(models.Model):
    cod_movimiento = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey('administracion.Almacen', models.DO_NOTHING, db_column='cod_almacen')
    cod_tipo_movimiento = models.ForeignKey('core.TipoMovimientoInventario', models.DO_NOTHING, db_column='cod_tipo_movimiento')
    cantidad = models.IntegerField()
    referencia_tipo = models.CharField(max_length=60, blank=True, null=True)
    referencia_id = models.BigIntegerField(blank=True, null=True)
    stock_total_resultante = models.IntegerField()
    stock_reservado_resultante = models.IntegerField()
    observacion = models.TextField(blank=True, null=True)
    fecha_movimiento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'movimiento_inventario'

class ReservaInventario(models.Model):
    cod_reserva = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey('administracion.Almacen', models.DO_NOTHING, db_column='cod_almacen')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido', blank=True, null=True)
    cod_lote = models.ForeignKey('administracion.LoteInventario', models.DO_NOTHING, db_column='cod_lote', blank=True, null=True)
    cod_pedido_detalle = models.ForeignKey('operaciones.PedidoDetalle', models.DO_NOTHING, db_column='cod_pedido_detalle', blank=True, null=True)
    cantidad = models.IntegerField()
    estado = models.CharField(max_length=30)
    estado_reserva = models.CharField(max_length=30)
    expira_en = models.DateTimeField()
    fecha_expiracion = models.DateTimeField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'reserva_inventario'

class AlertaStock(models.Model):
    cod_alerta = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey('administracion.Almacen', models.DO_NOTHING, db_column='cod_almacen')
    tipo_alerta = models.CharField(max_length=40)
    mensaje = models.TextField()
    atendida = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'alerta_stock'

class Cupon(models.Model):
    cod_cupon = models.BigAutoField(primary_key=True)
    codigo = models.CharField(unique=True, max_length=60)
    nombre = models.CharField(max_length=160)
    descripcion = models.TextField(blank=True, null=True)
    tipo_descuento = models.CharField(max_length=20)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    monto_minimo = models.DecimalField(max_digits=12, decimal_places=2)
    usos_maximos = models.IntegerField(blank=True, null=True)
    usos_por_usuario = models.IntegerField()
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'cupon'

class CuponUso(models.Model):
    cod_cupon_uso = models.BigAutoField(primary_key=True)
    cod_cupon = models.ForeignKey('administracion.Cupon', models.DO_NOTHING, db_column='cod_cupon')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    valor_aplicado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_uso = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'cupon_uso'
        unique_together = (('cod_cupon', 'cod_pedido'),)

class Promocion(models.Model):
    cod_promocion = models.BigAutoField(primary_key=True)
    codigo = models.CharField(unique=True, max_length=60)
    nombre = models.CharField(max_length=160)
    descripcion = models.TextField(blank=True, null=True)
    tipo_descuento = models.CharField(max_length=20)
    valor = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_inicio = models.DateTimeField()
    fecha_fin = models.DateTimeField()
    acumulable = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'promocion'

class PromocionProducto(models.Model):
    pk = models.CompositePrimaryKey('cod_promocion', 'cod_producto')
    cod_promocion = models.ForeignKey('administracion.Promocion', models.DO_NOTHING, db_column='cod_promocion')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')

    class Meta:
        managed = False
        db_table = 'promocion_producto'

class LogBusqueda(models.Model):
    cod_log_busqueda = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    termino = models.CharField(max_length=200)
    resultados = models.IntegerField()
    fecha_busqueda = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_busqueda'

class LogProductoVisto(models.Model):
    cod_log_producto_visto = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    fecha_vista = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_producto_visto'

class LogCarritoAbandonado(models.Model):
    cod_log_carrito_abandonado = models.BigAutoField(primary_key=True)
    cod_carrito = models.ForeignKey('clientes.Carrito', models.DO_NOTHING, db_column='cod_carrito')
    total_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_registro = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_carrito_abandonado'

class EventoRecomendacion(models.Model):
    cod_evento_recomendacion = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    cod_producto_origen = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto_origen', blank=True, null=True)
    cod_producto_recomendado = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto_recomendado', related_name='eventorecomendacion_cod_producto_recomendado_set')
    motivo = models.CharField(max_length=120)
    fecha_evento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'evento_recomendacion'

class ResumenVentaDiaria(models.Model):
    fecha = models.DateField(primary_key=True)
    total_pedidos = models.IntegerField()
    total_ventas = models.DecimalField(max_digits=12, decimal_places=2)
    total_clientes = models.IntegerField()
    ticket_promedio = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'resumen_venta_diaria'

class SnapshotKpi(models.Model):
    cod_snapshot = models.BigAutoField(primary_key=True)
    nombre_kpi = models.CharField(max_length=120)
    valor = models.DecimalField(max_digits=14, decimal_places=2)
    unidad = models.CharField(max_length=40, blank=True, null=True)
    fecha_snapshot = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'snapshot_kpi'

class SegmentoCliente(models.Model):
    cod_segmento = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    segmento = models.CharField(max_length=80)
    motivo = models.TextField(blank=True, null=True)
    fecha_segmentacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'segmento_cliente'
        unique_together = (('cod_usuario', 'segmento'),)
