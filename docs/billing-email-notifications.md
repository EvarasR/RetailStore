# Facturación, correo transaccional y preferencias

## Flujo de factura

PostgreSQL es la fuente de verdad. `fn_capturar_pago_simulado` crea una única
factura al capturar el pago; `factura.cod_pedido` es único y el trigger
`trg_factura_exige_pago_capturado` rechaza una factura sin una transacción
`CAPTURADO`. Los importes del PDF se leen de `pedido`, `pedido_detalle` y
`factura`; Django no recalcula precios, descuentos ni impuestos.

El PDF se genera en memoria con ReportLab. No se publica en `/media` ni se
expone mediante Nginx. El endpoint privado valida propietario o rol autorizado:

- `GET /operaciones/api/facturas/`
- `GET /operaciones/api/facturas/<id>/`
- `GET /operaciones/api/facturas/<id>/pdf/`
- `POST /operaciones/api/facturas/<id>/reenviar/`

La descarga usa `Content-Disposition: attachment`; el detalle usa `inline`.
El comprobante se identifica como factura comercial TechTail y aclara que no
es un comprobante electrónico autorizado por el SRI.

## Cola de correo

La migración SQL `ARCHIVOS SQL/12_billing_email_google_auth_patch.sql` amplía
`cola_email` con tipo, cuerpos HTML/texto, contexto JSON, referencias,
idempotencia, programación, bloqueo y reintentos. Es aditiva e idempotente.
Debe aplicarse antes de iniciar la nueva versión:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f "ARCHIVOS SQL/12_billing_email_google_auth_patch.sql"
```

El worker usa `SELECT ... FOR UPDATE SKIP LOCKED`, reclama lotes de forma
atómica y recupera reclamos abandonados tras 15 minutos. Un fallo se marca sin
exponer credenciales y reprograma con espera exponencial. Después de agotar
`max_intentos` queda `FALLIDO` y un administrador puede reintentarlo desde
`/admin/emails`.

```bash
./entorno/bin/python manage.py procesar_cola_emails --lote 20
./entorno/bin/python manage.py procesar_cola_emails --lote 20 --continuo --espera 10
```

La cola cubre bienvenida, factura con PDF adjunto, descuento de wishlist y
respuesta pública de soporte. Una excepción de correo nunca revierte el pago,
la factura, la promoción ni la respuesta del ticket.

## Preferencias

`GET/POST /operaciones/api/preferencias-notificacion/` administra avisos web y
emails de pedidos, descuentos, Prime y soporte. Las preferencias se crean con
valores permisivos para cuentas existentes. La factura siempre puede verse en
la cuenta aunque el usuario desactive emails.

## SMTP Gmail

Usa una cuenta con verificación en dos pasos y una contraseña de aplicación;
nunca la contraseña normal. Configura en `.env`:

```dotenv
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=pozitoworld@gmail.com
EMAIL_HOST_PASSWORD=CHANGE_ME_APP_PASSWORD
DEFAULT_FROM_EMAIL=TechTail <pozitoworld@gmail.com>
FRONTEND_BASE_URL=https://tienda.example.com
```

Prueba primero con una dirección controlada y confirma HTML, texto alternativo,
PDF adjunto y que no haya secretos ni datos de otros clientes en los logs.
