# Modelos Django mapeados desde una base PostgreSQL existente.
# Proyecto: Retail Prime
# Importante:
# - No renombrar db_table ni db_column.
# - managed = False porque la estructura la controlan los archivos SQL.
# - Las tablas con llave primaria compuesta usan models.CompositePrimaryKey.
# - Requiere Django 5.2 o superior para CompositePrimaryKey.

from django.db import models


class Pedido(models.Model):
    cod_pedido = models.BigAutoField(primary_key=True)
    numero_pedido = models.CharField(unique=True, max_length=40)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
    cod_direccion_envio = models.ForeignKey('core.DireccionUsuario', models.DO_NOTHING, db_column='cod_direccion_envio')
    cod_estado_pedido = models.ForeignKey('core.EstadoPedido', models.DO_NOTHING, db_column='cod_estado_pedido')
    cod_metodo_envio = models.ForeignKey('operaciones.MetodoEnvio', models.DO_NOTHING, db_column='cod_metodo_envio', blank=True, null=True)
    cod_zona_entrega = models.ForeignKey('operaciones.ZonaEntrega', models.DO_NOTHING, db_column='cod_zona_entrega', blank=True, null=True)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    descuento = models.DecimalField(max_digits=12, decimal_places=2)
    impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    tasa_impuesto = models.DecimalField(max_digits=8, decimal_places=4)
    costo_envio = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_estimada_entrega = models.DateTimeField(blank=True, null=True)
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
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_producto = models.ForeignKey('administracion.Producto', models.DO_NOTHING, db_column='cod_producto')
    cantidad = models.IntegerField()
    precio_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    precio_base_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_promocion_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_prime_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_cupon_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    precio_final_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal_linea = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'pedido_detalle'
        unique_together = (('cod_pedido', 'cod_producto'),)


class PedidoDetalleLote(models.Model):
    cod_pedido_detalle_lote = models.BigAutoField(primary_key=True)
    cod_pedido_detalle = models.ForeignKey('operaciones.PedidoDetalle', models.DO_NOTHING, db_column='cod_pedido_detalle')
    cod_lote = models.ForeignKey('administracion.LoteInventario', models.DO_NOTHING, db_column='cod_lote')
    cantidad = models.IntegerField()
    costo_unitario_historico = models.DecimalField(max_digits=12, decimal_places=4)
    pvp_unitario_historico = models.DecimalField(max_digits=12, decimal_places=2)
    descuento_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    precio_final_unitario = models.DecimalField(max_digits=12, decimal_places=2)
    subtotal_linea_lote = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_asignacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedido_detalle_lote'
        unique_together = (('cod_pedido_detalle', 'cod_lote'),)

class PedidoEstadoHistorial(models.Model):
    cod_historial = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_estado_pedido = models.ForeignKey('core.EstadoPedido', models.DO_NOTHING, db_column='cod_estado_pedido')
    comentario = models.TextField(blank=True, null=True)
    fecha_estado = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'pedido_estado_historial'

class Factura(models.Model):
    cod_factura = models.BigAutoField(primary_key=True)
    cod_pedido = models.OneToOneField('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    numero_factura = models.CharField(unique=True, max_length=40)
    subtotal = models.DecimalField(max_digits=12, decimal_places=2)
    descuento = models.DecimalField(max_digits=12, decimal_places=2)
    impuesto = models.DecimalField(max_digits=12, decimal_places=2)
    tasa_impuesto = models.DecimalField(max_digits=8, decimal_places=4)
    costo_envio = models.DecimalField(max_digits=12, decimal_places=2)
    total = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_emision = models.DateTimeField()
    estado = models.CharField(max_length=30)

    class Meta:
        managed = False
        db_table = 'factura'

class Devolucion(models.Model):
    cod_devolucion = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
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
    cod_devolucion = models.ForeignKey('operaciones.Devolucion', models.DO_NOTHING, db_column='cod_devolucion')
    cod_pedido_detalle = models.ForeignKey('operaciones.PedidoDetalle', models.DO_NOTHING, db_column='cod_pedido_detalle')
    cantidad = models.IntegerField()
    monto_linea = models.DecimalField(max_digits=12, decimal_places=2)

    class Meta:
        managed = False
        db_table = 'devolucion_detalle'

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

class MetodoPago(models.Model):
    cod_metodo_pago = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
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

class CuentaSimulada(models.Model):
    cod_cuenta = models.BigAutoField(primary_key=True)
    cod_metodo_pago = models.OneToOneField('operaciones.MetodoPago', models.DO_NOTHING, db_column='cod_metodo_pago')
    saldo_disponible = models.DecimalField(max_digits=12, decimal_places=2)
    limite_diario = models.DecimalField(max_digits=12, decimal_places=2)
    monto_usado_hoy = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_uso = models.DateField()
    bloqueada = models.BooleanField()
    activa = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'cuenta_simulada'

class TransaccionPago(models.Model):
    cod_transaccion = models.BigAutoField(primary_key=True)
    cod_pedido = models.ForeignKey('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_metodo_pago = models.ForeignKey('operaciones.MetodoPago', models.DO_NOTHING, db_column='cod_metodo_pago')
    idempotency_key = models.CharField(unique=True, max_length=120)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    cod_estado_pago = models.ForeignKey('core.EstadoPago', models.DO_NOTHING, db_column='cod_estado_pago')
    mensaje = models.TextField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'transaccion_pago'

class AutorizacionPago(models.Model):
    cod_autorizacion = models.BigAutoField(primary_key=True)
    cod_transaccion = models.OneToOneField('operaciones.TransaccionPago', models.DO_NOTHING, db_column='cod_transaccion')
    codigo_autorizacion = models.CharField(unique=True, max_length=50)
    monto_autorizado = models.DecimalField(max_digits=12, decimal_places=2)
    fecha_autorizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'autorizacion_pago'

class ReembolsoPago(models.Model):
    cod_reembolso = models.BigAutoField(primary_key=True)
    cod_transaccion = models.ForeignKey('operaciones.TransaccionPago', models.DO_NOTHING, db_column='cod_transaccion')
    cod_devolucion = models.ForeignKey('operaciones.Devolucion', models.DO_NOTHING, db_column='cod_devolucion', blank=True, null=True)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    estado = models.CharField(max_length=30)
    fecha_reembolso = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'reembolso_pago'

class Transportista(models.Model):
    cod_transportista = models.BigAutoField(primary_key=True)
    nombre = models.CharField(unique=True, max_length=120)
    telefono = models.CharField(max_length=30, blank=True, null=True)
    email = models.CharField(max_length=180, blank=True, null=True)
    activo = models.BooleanField()

    class Meta:
        managed = False
        db_table = 'transportista'

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

class Envio(models.Model):
    cod_envio = models.BigAutoField(primary_key=True)
    cod_pedido = models.OneToOneField('operaciones.Pedido', models.DO_NOTHING, db_column='cod_pedido')
    cod_transportista = models.ForeignKey('operaciones.Transportista', models.DO_NOTHING, db_column='cod_transportista', blank=True, null=True)
    cod_metodo_envio = models.ForeignKey('operaciones.MetodoEnvio', models.DO_NOTHING, db_column='cod_metodo_envio')
    numero_tracking = models.CharField(unique=True, max_length=60)
    estado = models.CharField(max_length=40)
    estado_envio = models.CharField(max_length=40, blank=True, null=True)
    fecha_estimada_entrega = models.DateField(blank=True, null=True)
    fecha_entrega = models.DateTimeField(blank=True, null=True)
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'envio'

class TrackingEvento(models.Model):
    cod_tracking_evento = models.BigAutoField(primary_key=True)
    cod_envio = models.ForeignKey('operaciones.Envio', models.DO_NOTHING, db_column='cod_envio')
    cod_tipo_evento = models.ForeignKey('core.TipoEventoTracking', models.DO_NOTHING, db_column='cod_tipo_evento')
    descripcion = models.TextField()
    ubicacion = models.CharField(max_length=160, blank=True, null=True)
    visible_cliente = models.BooleanField()
    fecha_evento = models.DateTimeField()
    orden = models.IntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'tracking_evento'


class TrackingEventoProgramado(models.Model):
    cod_programacion = models.BigAutoField(primary_key=True)
    cod_envio = models.ForeignKey('operaciones.Envio', models.DO_NOTHING, db_column='cod_envio')
    cod_tipo_evento = models.ForeignKey('core.TipoEventoTracking', models.DO_NOTHING, db_column='cod_tipo_evento')
    descripcion = models.TextField()
    ubicacion = models.TextField(blank=True, null=True)
    fecha_programada = models.DateTimeField()
    procesado = models.BooleanField()
    fecha_procesado = models.DateTimeField(blank=True, null=True)
    orden = models.IntegerField()
    visible_cliente = models.BooleanField()
    fecha_creacion = models.DateTimeField()
    fecha_actualizacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'tracking_evento_programado'
        unique_together = (('cod_envio', 'orden'),)

class Notificacion(models.Model):
    cod_notificacion = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
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

class ColaEmail(models.Model):
    cod_email = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
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

class SoporteTicket(models.Model):
    cod_ticket = models.BigAutoField(primary_key=True)
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario')
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
    cod_ticket = models.ForeignKey('operaciones.SoporteTicket', models.DO_NOTHING, db_column='cod_ticket')
    cod_usuario = models.ForeignKey('core.Usuario', models.DO_NOTHING, db_column='cod_usuario', blank=True, null=True)
    mensaje = models.TextField()
    interno = models.BooleanField()
    fecha_creacion = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'soporte_ticket_mensaje'
