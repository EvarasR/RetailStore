# This is an auto-generated Django model module.
# You'll have to do the following manually to clean this up:
#   * Rearrange models' order
#   * Make sure each model has one field with primary_key=True
#   * Make sure each ForeignKey and OneToOneField has `on_delete` set to the desired behavior
#   * Remove `managed = False` lines if you wish to allow Django to create, modify, and delete the table
# Feel free to rename the models, but don't rename db_table values or field names.
from django.db import models


class AlertaStock(models.Model):
    cod_alerta = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey('Almacen', models.DO_NOTHING, db_column='cod_almacen')
    tipo_alerta = models.CharField(max_length=40)
    mensaje = models.TextField()
    atendida = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'alerta_stock'


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


class AutorizacionPago(models.Model):
    cod_autorizacion = models.BigAutoField(primary_key=True)
    cod_transaccion = models.OneToOneField('TransaccionPago', models.DO_NOTHING, db_column='cod_transaccion')
    codigo_autorizacion = models.CharField(unique=True, max_length=50)
    monto_autorizado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_autorizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'autorizacion_pago'


class BeneficioMembresia(models.Model):
    cod_beneficio = models.BigAutoField(primary_key=True)
    cod_plan = models.ForeignKey('PlanMembresia', models.DO_NOTHING, db_column='cod_plan')
    codigo = models.CharField(max_length=80)
    nombre = models.CharField(max_length=120)
    valor = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'beneficio_membresia'
        unique_together = (('cod_plan', 'codigo'),)


class BibliotecaUsuario(models.Model):
    cod_biblioteca = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_contenido = models.ForeignKey('ContenidoDigital', models.DO_NOTHING, db_column='cod_contenido')
    fecha_agregado = models.DateTimeField()
    fecha_expiracion = models.DateField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'biblioteca_usuario'
        unique_together = (('cod_usuario', 'cod_contenido'),)


class BinTarjeta(models.Model):
    cod_bin = models.BigAutoField(primary_key=True)
    marca = models.CharField(max_length=40)
    prefijo = models.CharField(unique=True, max_length=10)
    longitud_min = models.SmallIntegerField()
    longitud_max = models.SmallIntegerField()
    cvv_longitud = models.SmallIntegerField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'bin_tarjeta'


class Carrito(models.Model):
    cod_carrito = models.BigAutoField(primary_key=True)
    cod_usuario = models.OneToOneField('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    estado = models.CharField(max_length=30)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'carrito'


class CarritoDetalle(models.Model):
    cod_carrito_detalle = models.BigAutoField(primary_key=True)
    cod_carrito = models.ForeignKey(Carrito, models.DO_NOTHING, db_column='cod_carrito')
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()
    precio_unitario_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'carrito_detalle'
        unique_together = (('cod_carrito', 'cod_producto'),)


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


class ColaEmail(models.Model):
    cod_email = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    destinatario = models.CharField(max_length=180)
    asunto = models.CharField(max_length=220)
    cuerpo = models.TextField()
    estado = models.CharField(max_length=30)
    intentos = models.IntegerField()
    error_ultimo = models.TextField(blank=True, null=True)
    fecha_programada = models.DateTimeField()
    fecha_envio = models.DateTimeField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'cola_email'


class CompraRecurrente(models.Model):
    cod_compra_recurrente = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
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
    cod_compra_recurrente = models.ForeignKey(CompraRecurrente, models.DO_NOTHING, db_column='cod_compra_recurrente')
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'compra_recurrente_detalle'
        unique_together = (('cod_compra_recurrente', 'cod_producto'),)


class ContenidoDigital(models.Model):
    cod_contenido = models.BigAutoField(primary_key=True)
    titulo = models.CharField(max_length=180)
    tipo = models.CharField(max_length=40)
    descripcion = models.TextField(blank=True, null=True)
    url_contenido = models.TextField()
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto', blank=True, null=True)
    requiere_premium = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'contenido_digital'


class CuentaSimulada(models.Model):
    cod_cuenta = models.BigAutoField(primary_key=True)
    cod_metodo_pago = models.OneToOneField('MetodoPago', models.DO_NOTHING, db_column='cod_metodo_pago')
    saldo_disponible = models.DecimalField(max_digits=12, decimal_places=2)
    limite_diario = models.DecimalField(max_digits=12, decimal_places=2)
    monto_usado_hoy = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_uso = models.DateField()
    bloqueada = models.BooleanField()
    activa = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'cuenta_simulada'


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
    cod_cupon = models.ForeignKey(Cupon, models.DO_NOTHING, db_column='cod_cupon')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_pedido = models.ForeignKey('Pedido', models.DO_NOTHING, db_column='cod_pedido')
    valor_aplicado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_uso = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'cupon_uso'
        unique_together = (('cod_cupon', 'cod_pedido'),)


class Devolucion(models.Model):
    cod_devolucion = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey('Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    motivo = models.CharField(max_length=160)
    descripcion = models.TextField(blank=True, null=True)
    estado = models.CharField(max_length=30)
    monto_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'devolucion'


class DevolucionDetalle(models.Model):
    cod_devolucion_detalle = models.BigAutoField(primary_key=True)
    cod_devolucion = models.ForeignKey(Devolucion, models.DO_NOTHING, db_column='cod_devolucion')
    cod_pedido_detalle = models.ForeignKey('PedidoDetalle', models.DO_NOTHING, db_column='cod_pedido_detalle')
    cantidad = models.IntegerField()
    monto_linea = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'devolucion_detalle'


class DireccionUsuario(models.Model):
    cod_direccion = models.BigAutoField(primary_key=True)
    cod_usuario = models.OneToOneField('Usuario', models.DO_NOTHING, db_column='cod_usuario')
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


class Envio(models.Model):
    cod_envio = models.BigAutoField(primary_key=True)
    cod_pedido = models.OneToOneField('Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_transportista = models.ForeignKey('Transportista', models.DO_NOTHING, db_column='cod_transportista', blank=True, null=True)
    cod_metodo_envio = models.ForeignKey('MetodoEnvio', models.DO_NOTHING, db_column='cod_metodo_envio')
    numero_tracking = models.CharField(unique=True, max_length=60)
    estado = models.CharField(max_length=40)
    fecha_estimada_entrega = models.DateField(blank=True, null=True)
    fecha_entrega = models.DateTimeField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'envio'


class EstadoMembresia(models.Model):
    cod_estado_membresia = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)

    class Meta:
        managed = False
        db_table = 'estado_membresia'


class EstadoPago(models.Model):
    cod_estado_pago = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)

    class Meta:
        managed = False
        db_table = 'estado_pago'


class EstadoPedido(models.Model):
    cod_estado_pedido = models.CharField(primary_key=True, max_length=40)
    nombre = models.CharField(max_length=100)
    orden = models.IntegerField(unique=True)
    genera_tracking = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'estado_pedido'


class EstadoProducto(models.Model):
    cod_estado_producto = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'estado_producto'


class EventoRecomendacion(models.Model):
    cod_evento_recomendacion = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    cod_producto_origen = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto_origen', blank=True, null=True)
    cod_producto_recomendado = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto_recomendado', related_name='eventorecomendacion_cod_producto_recomendado_set')
    motivo = models.CharField(max_length=120)
    fecha_evento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'evento_recomendacion'


class Factura(models.Model):
    cod_factura = models.BigAutoField(primary_key=True)
    cod_pedido = models.OneToOneField('Pedido', models.DO_NOTHING, db_column='cod_pedido')
    numero_factura = models.CharField(unique=True, max_length=40)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_emision = models.DateTimeField()
    estado = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'factura'


class HistorialPrecioProducto(models.Model):
    cod_historial_precio = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    precio_anterior = models.DecimalField(max_digits=12, decimal_places=2)
    precio_nuevo = models.DecimalField(max_digits=12, decimal_places=2)
    motivo = models.TextField(blank=True, null=True)
    fecha_cambio = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'historial_precio_producto'


class HistorialProveedor(models.Model):
    cod_historial = models.BigAutoField(primary_key=True)
    cod_proveedor = models.ForeignKey('Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    evento = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, null=True)
    fecha_evento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'historial_proveedor'


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


class Inventario(models.Model):
    cod_inventario = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey(Almacen, models.DO_NOTHING, db_column='cod_almacen')
    stock_total = models.IntegerField()
    stock_reservado = models.IntegerField()
    stock_minimo = models.IntegerField()
    stock_maximo = models.IntegerField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'inventario'
        unique_together = (('cod_producto', 'cod_almacen'),)


class LogBusqueda(models.Model):
    cod_log_busqueda = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    termino = models.CharField(max_length=200)
    resultados = models.IntegerField()
    fecha_busqueda = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_busqueda'


class LogCarritoAbandonado(models.Model):
    cod_log_carrito_abandonado = models.BigAutoField(primary_key=True)
    cod_carrito = models.ForeignKey(Carrito, models.DO_NOTHING, db_column='cod_carrito')
    total_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_registro = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_carrito_abandonado'


class LogProductoVisto(models.Model):
    cod_log_producto_visto = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    fecha_vista = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'log_producto_visto'


class Marca(models.Model):
    cod_marca = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'marca'


class MembresiaUsuario(models.Model):
    cod_membresia = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_plan = models.ForeignKey('PlanMembresia', models.DO_NOTHING, db_column='cod_plan')
    cod_estado_membresia = models.ForeignKey(EstadoMembresia, models.DO_NOTHING, db_column='cod_estado_membresia')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    renovacion_automatica = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'membresia_usuario'


class MetodoEnvio(models.Model):
    cod_metodo_envio = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    dias_min = models.IntegerField()
    dias_max = models.IntegerField()
    costo_base = models.DecimalField(max_digits=12, decimal_places=2)
    es_premium_gratis = models.BooleanField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'metodo_envio'


class MetodoPago(models.Model):
    cod_metodo_pago = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    tipo = models.CharField(max_length=30)
    marca = models.CharField(max_length=40)
    bin6 = models.CharField(max_length=6)
    ultimos4 = models.CharField(max_length=4)
    token_simulado = models.UUIDField()
    titular = models.CharField(max_length=180)
    exp_mes = models.SmallIntegerField()
    exp_anio = models.SmallIntegerField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'metodo_pago'


class MovimientoInventario(models.Model):
    cod_movimiento = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey(Almacen, models.DO_NOTHING, db_column='cod_almacen')
    cod_tipo_movimiento = models.ForeignKey('TipoMovimientoInventario', models.DO_NOTHING, db_column='cod_tipo_movimiento')
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


class Notificacion(models.Model):
    cod_notificacion = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    tipo = models.CharField(max_length=60)
    titulo = models.CharField(max_length=180)
    mensaje = models.TextField()
    url_accion = models.TextField(blank=True, null=True)
    leida = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_lectura = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'notificacion'


class OrdenAbastecimiento(models.Model):
    cod_orden_abastecimiento = models.BigAutoField(primary_key=True)
    cod_proveedor = models.ForeignKey('Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
    cod_pedido = models.ForeignKey('Pedido', models.DO_NOTHING, db_column='cod_pedido', blank=True, null=True)
    estado = models.CharField(max_length=30)
    total_estimado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'orden_abastecimiento'


class OrdenAbastecimientoDetalle(models.Model):
    cod_orden_abastecimiento_detalle = models.BigAutoField(primary_key=True)
    cod_orden_abastecimiento = models.ForeignKey(OrdenAbastecimiento, models.DO_NOTHING, db_column='cod_orden_abastecimiento')
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()
    costo_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'orden_abastecimiento_detalle'


class PagoMembresia(models.Model):
    cod_pago_membresia = models.BigAutoField(primary_key=True)
    cod_membresia = models.ForeignKey(MembresiaUsuario, models.DO_NOTHING, db_column='cod_membresia')
    cod_transaccion = models.ForeignKey('TransaccionPago', models.DO_NOTHING, db_column='cod_transaccion', blank=True, null=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_pago = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pago_membresia'


class ParametroSistema(models.Model):
    clave = models.CharField(primary_key=True, max_length=120)
    valor = models.TextField()
    descripcion = models.TextField(blank=True, null=True)
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'parametro_sistema'


class Pedido(models.Model):
    cod_pedido = models.BigAutoField(primary_key=True)
    numero_pedido = models.CharField(unique=True, max_length=40)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_direccion_envio = models.ForeignKey(DireccionUsuario, models.DO_NOTHING, db_column='cod_direccion_envio')
    cod_estado_pedido = models.ForeignKey(EstadoPedido, models.DO_NOTHING, db_column='cod_estado_pedido')
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    descuento = models.DecimalField(max_digits=12, decimal_places=2)
    costo_envio = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    es_premium = models.BooleanField()
    requiere_abastecimiento = models.BooleanField()
    observacion = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedido'


class PedidoDetalle(models.Model):
    cod_pedido_detalle = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey(Pedido, models.DO_NOTHING, db_column='cod_pedido')
    cod_producto = models.ForeignKey('Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal_linea = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'pedido_detalle'
        unique_together = (('cod_pedido', 'cod_producto'),)


class PedidoEstadoHistorial(models.Model):
    cod_historial = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey(Pedido, models.DO_NOTHING, db_column='cod_pedido')
    cod_estado_pedido = models.ForeignKey(EstadoPedido, models.DO_NOTHING, db_column='cod_estado_pedido')
    comentario = models.TextField(blank=True, null=True)
    fecha_estado = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedido_estado_historial'


class PerfilUsuario(models.Model):
    cod_perfil = models.BigAutoField(primary_key=True)
    cod_usuario = models.OneToOneField('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    acepta_marketing = models.BooleanField()
    idioma_preferido = models.CharField(max_length=10)
    moneda_preferida = models.CharField(max_length=10)
    metadata = models.JSONField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'perfil_usuario'


class Permiso(models.Model):
    cod_permiso = models.BigAutoField(primary_key=True)
    codigo = models.CharField(unique=True, max_length=100)
    nombre = models.CharField(max_length=120)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'permiso'


class PlanMembresia(models.Model):
    cod_plan = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    precio_mensual = models.DecimalField(max_digits=12, decimal_places=2)
    duracion_dias = models.IntegerField()
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'plan_membresia'


class Producto(models.Model):
    cod_producto = models.BigAutoField(primary_key=True)
    cod_categoria = models.ForeignKey(Categoria, models.DO_NOTHING, db_column='cod_categoria')
    cod_marca = models.ForeignKey(Marca, models.DO_NOTHING, db_column='cod_marca')
    sku = models.CharField(unique=True, max_length=80)
    nombre = models.CharField(max_length=180)
    descripcion = models.TextField()
    precio_actual = models.DecimalField(max_digits=12, decimal_places=2)
    peso_kg = models.DecimalField(max_digits=10, decimal_places=3)
    largo_cm = models.DecimalField(max_digits=10, decimal_places=2)
    ancho_cm = models.DecimalField(max_digits=10, decimal_places=2)
    alto_cm = models.DecimalField(max_digits=10, decimal_places=2)
    cod_estado_producto = models.ForeignKey(EstadoProducto, models.DO_NOTHING, db_column='cod_estado_producto')
    requiere_revision_mayorista = models.BooleanField()
    metadata = models.JSONField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto'


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
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    cod_atributo = models.ForeignKey(ProductoAtributo, models.DO_NOTHING, db_column='cod_atributo')
    valor = models.TextField()

    class Meta:
        managed = False
        db_table = 'producto_atributo_valor'


class ProductoFavorito(models.Model):
    pk = models.CompositePrimaryKey('cod_usuario', 'cod_producto')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_favorito'


class ProductoImagen(models.Model):
    cod_imagen = models.BigAutoField(primary_key=True)
    cod_producto = models.OneToOneField(Producto, models.DO_NOTHING, db_column='cod_producto')
    url_imagen = models.TextField()
    alt_text = models.CharField(max_length=180, blank=True, null=True)
    es_principal = models.BooleanField()
    orden = models.IntegerField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_imagen'


class ProductoPregunta(models.Model):
    cod_pregunta = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    pregunta = models.TextField()
    estado = models.CharField(max_length=30)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_pregunta'


class ProductoProveedor(models.Model):
    cod_producto_proveedor = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    cod_proveedor = models.ForeignKey('Proveedor', models.DO_NOTHING, db_column='cod_proveedor')
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


class ProductoRelacionado(models.Model):
    pk = models.CompositePrimaryKey('cod_producto', 'cod_producto_relacionado')
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    cod_producto_relacionado = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto_relacionado', related_name='productorelacionado_cod_producto_relacionado_set')
    tipo_relacion = models.CharField(max_length=40)

    class Meta:
        managed = False
        db_table = 'producto_relacionado'


class ProductoResena(models.Model):
    cod_resena = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    calificacion = models.SmallIntegerField()
    titulo = models.CharField(max_length=160, blank=True, null=True)
    comentario = models.TextField(blank=True, null=True)
    aprobado = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_resena'
        unique_together = (('cod_usuario', 'cod_producto'),)


class ProductoRespuesta(models.Model):
    cod_respuesta = models.BigAutoField(primary_key=True)
    cod_pregunta = models.OneToOneField(ProductoPregunta, models.DO_NOTHING, db_column='cod_pregunta')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    respuesta = models.TextField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'producto_respuesta'


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
    cod_promocion = models.ForeignKey(Promocion, models.DO_NOTHING, db_column='cod_promocion')
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')

    class Meta:
        managed = False
        db_table = 'promocion_producto'


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


class ProveedorContacto(models.Model):
    cod_contacto = models.BigAutoField(primary_key=True)
    cod_proveedor = models.OneToOneField(Proveedor, models.DO_NOTHING, db_column='cod_proveedor')
    nombre = models.CharField(max_length=160)
    cargo = models.CharField(max_length=100, blank=True, null=True)
    email = models.CharField(max_length=180, blank=True, null=True)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    principal = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'proveedor_contacto'


class ProveedorStock(models.Model):
    cod_proveedor_stock = models.BigAutoField(primary_key=True)
    cod_producto_proveedor = models.OneToOneField(ProductoProveedor, models.DO_NOTHING, db_column='cod_producto_proveedor')
    cantidad_disponible = models.IntegerField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'proveedor_stock'


class ReembolsoPago(models.Model):
    cod_reembolso = models.BigAutoField(primary_key=True)
    cod_transaccion = models.ForeignKey('TransaccionPago', models.DO_NOTHING, db_column='cod_transaccion')
    cod_devolucion = models.ForeignKey(Devolucion, models.DO_NOTHING, db_column='cod_devolucion', blank=True, null=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=30)
    fecha_reembolso = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'reembolso_pago'


class ReglaLimiteCompra(models.Model):
    cod_regla = models.BigAutoField(primary_key=True)
    cod_categoria = models.OneToOneField(Categoria, models.DO_NOTHING, db_column='cod_categoria', blank=True, null=True)
    cod_producto = models.OneToOneField(Producto, models.DO_NOTHING, db_column='cod_producto', blank=True, null=True)
    limite_por_pedido = models.IntegerField()
    limite_por_dia = models.IntegerField(blank=True, null=True)
    limite_por_mes = models.IntegerField(blank=True, null=True)
    requiere_revision = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'regla_limite_compra'


class ReservaInventario(models.Model):
    cod_reserva = models.BigAutoField(primary_key=True)
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    cod_almacen = models.ForeignKey(Almacen, models.DO_NOTHING, db_column='cod_almacen')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_pedido = models.ForeignKey(Pedido, models.DO_NOTHING, db_column='cod_pedido', blank=True, null=True)
    cantidad = models.IntegerField()
    estado = models.CharField(max_length=30)
    expira_en = models.DateTimeField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'reserva_inventario'


class ResumenVentaDiaria(models.Model):
    fecha = models.DateField(primary_key=True)
    total_pedidos = models.IntegerField()
    total_ventas = models.DecimalField(max_digits=12, decimal_places=2)
    total_clientes = models.IntegerField()
    ticket_promedio = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'resumen_venta_diaria'


class Rol(models.Model):
    cod_rol = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=60)
    descripcion = models.TextField(blank=True, null=True)
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'rol'


class RolPermiso(models.Model):
    pk = models.CompositePrimaryKey('cod_rol', 'cod_permiso')
    cod_rol = models.ForeignKey(Rol, models.DO_NOTHING, db_column='cod_rol')
    cod_permiso = models.ForeignKey(Permiso, models.DO_NOTHING, db_column='cod_permiso')

    class Meta:
        managed = False
        db_table = 'rol_permiso'


class SegmentoCliente(models.Model):
    cod_segmento = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    segmento = models.CharField(max_length=80)
    motivo = models.TextField(blank=True, null=True)
    fecha_segmentacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'segmento_cliente'
        unique_together = (('cod_usuario', 'segmento'),)


class SnapshotKpi(models.Model):
    cod_snapshot = models.BigAutoField(primary_key=True)
    nombre_kpi = models.CharField(max_length=120)
    valor = models.DecimalField(max_digits=14, decimal_places=2)
    unidad = models.CharField(max_length=40, blank=True, null=True)
    fecha_snapshot = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'snapshot_kpi'


class SoporteTicket(models.Model):
    cod_ticket = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    asunto = models.CharField(max_length=180)
    categoria = models.CharField(max_length=80)
    prioridad = models.CharField(max_length=20)
    estado = models.CharField(max_length=30)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()
    fecha_cierre = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'soporte_ticket'


class SoporteTicketMensaje(models.Model):
    cod_ticket_mensaje = models.BigAutoField(primary_key=True)
    cod_ticket = models.ForeignKey(SoporteTicket, models.DO_NOTHING, db_column='cod_ticket')
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    mensaje = models.TextField()
    interno = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'soporte_ticket_mensaje'


class TipoEventoTracking(models.Model):
    cod_tipo_evento = models.CharField(primary_key=True, max_length=40)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tipo_evento_tracking'


class TipoMovimientoInventario(models.Model):
    cod_tipo_movimiento = models.CharField(primary_key=True, max_length=30)
    nombre = models.CharField(max_length=80)
    signo = models.SmallIntegerField()

    class Meta:
        managed = False
        db_table = 'tipo_movimiento_inventario'


class TrackingEvento(models.Model):
    cod_tracking_evento = models.BigAutoField(primary_key=True)
    cod_envio = models.ForeignKey(Envio, models.DO_NOTHING, db_column='cod_envio')
    cod_tipo_evento = models.ForeignKey(TipoEventoTracking, models.DO_NOTHING, db_column='cod_tipo_evento')
    descripcion = models.TextField()
    ubicacion = models.CharField(max_length=160, blank=True, null=True)
    visible_cliente = models.BooleanField()
    fecha_evento = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'tracking_evento'


class TransaccionPago(models.Model):
    cod_transaccion = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey(Pedido, models.DO_NOTHING, db_column='cod_pedido')
    cod_metodo_pago = models.ForeignKey(MetodoPago, models.DO_NOTHING, db_column='cod_metodo_pago')
    idempotency_key = models.CharField(unique=True, max_length=120)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    cod_estado_pago = models.ForeignKey(EstadoPago, models.DO_NOTHING, db_column='cod_estado_pago')
    mensaje = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'transaccion_pago'


class Transportista(models.Model):
    cod_transportista = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    email = models.CharField(max_length=180, blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'transportista'


class UsoBeneficio(models.Model):
    cod_uso_beneficio = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_beneficio = models.ForeignKey(BeneficioMembresia, models.DO_NOTHING, db_column='cod_beneficio')
    cod_pedido = models.ForeignKey(Pedido, models.DO_NOTHING, db_column='cod_pedido', blank=True, null=True)
    valor_aplicado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_uso = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'uso_beneficio'


class Usuario(models.Model):
    cod_usuario = models.BigAutoField(primary_key=True)
    email = models.CharField(unique=True, max_length=180)
    password = models.TextField(db_column="password_hash")
    nombres = models.CharField(max_length=120)
    apellidos = models.CharField(max_length=120)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    documento_identidad = models.CharField(unique=True, max_length=40, blank=True, null=True)
    email_verificado = models.BooleanField()
    activo = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()
    ultimo_login = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'usuario'


class UsuarioRol(models.Model):
    pk = models.CompositePrimaryKey('cod_usuario', 'cod_rol')
    cod_usuario = models.ForeignKey(Usuario, models.DO_NOTHING, db_column='cod_usuario')
    cod_rol = models.ForeignKey(Rol, models.DO_NOTHING, db_column='cod_rol')
    fecha_asignacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'usuario_rol'


class Wishlist(models.Model):
    cod_wishlist = models.BigAutoField(primary_key=True)
    cod_usuario = models.OneToOneField(Usuario, models.DO_NOTHING, db_column='cod_usuario')
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
    cod_wishlist = models.ForeignKey(Wishlist, models.DO_NOTHING, db_column='cod_wishlist')
    cod_producto = models.ForeignKey(Producto, models.DO_NOTHING, db_column='cod_producto')
    fecha_agregado = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'wishlist_detalle'


class ZonaEntrega(models.Model):
    cod_zona = models.BigAutoField(primary_key=True)
    ciudad = models.CharField(max_length=120)
    provincia = models.CharField(max_length=120)
    recargo = models.DecimalField(max_digits=12, decimal_places=2)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'zona_entrega'
        unique_together = (('ciudad', 'provincia'),)
