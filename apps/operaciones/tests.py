from io import StringIO
from unittest.mock import patch
from types import SimpleNamespace
from decimal import Decimal
from datetime import datetime, timezone

from django.core.management import call_command
from django.test import SimpleTestCase
from django.test import override_settings
from django.core import mail

from apps.operaciones.services.factura_service import generar_factura_pdf
from apps.operaciones.services.email_service import enviar_email_encolado


class FacturaPdfTests(SimpleTestCase):
    @patch("apps.operaciones.services.factura_service.TransaccionPago.objects.filter")
    @patch("apps.operaciones.services.factura_service.PedidoDetalle.objects.filter")
    def test_genera_pdf_valido_sin_recalcular_totales(self, detalles_filter, tx_filter):
        usuario = SimpleNamespace(
            email="cliente@example.com", documento_identidad="0102030405",
            get_full_name=lambda: "Cliente Prueba",
        )
        direccion = SimpleNamespace(linea1="Calle Uno", ciudad="Quito", provincia="Pichincha", pais="Ecuador")
        pedido = SimpleNamespace(
            numero_pedido="PED-TEST", cod_usuario=usuario, cod_direccion_envio=direccion,
        )
        factura = SimpleNamespace(
            numero_factura="FAC-TEST", fecha_emision=datetime(2026, 8, 8, tzinfo=timezone.utc),
            estado="EMITIDA", subtotal=Decimal("100.00"), descuento=Decimal("5.00"),
            impuesto=Decimal("14.25"), tasa_impuesto=Decimal("15.00"),
            costo_envio=Decimal("2.00"), total=Decimal("111.25"), cod_pedido=pedido,
        )
        producto = SimpleNamespace(nombre="Teclado", sku="TEC-001")
        detalle = SimpleNamespace(
            cod_producto=producto, cantidad=1, precio_base_unitario=Decimal("100.00"),
            descuento_promocion_unitario=Decimal("5.00"), descuento_prime_unitario=Decimal("0.00"),
            descuento_cupon_unitario=Decimal("0.00"), subtotal_linea=Decimal("95.00"),
        )
        detalles_filter.return_value.select_related.return_value.order_by.return_value = [detalle]
        tx_filter.return_value.select_related.return_value.order_by.return_value.first.return_value = None

        content = generar_factura_pdf(factura)

        self.assertTrue(content.startswith(b"%PDF-"))
        self.assertGreater(len(content), 1500)


class EmailTransaccionalTests(SimpleTestCase):
    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    @patch("apps.operaciones.services.email_service._contexto_email")
    def test_envia_texto_y_html(self, contexto):
        contexto.return_value = ("generico", {"mensaje": "Contenido seguro"}, None)
        email = SimpleNamespace(
            asunto="Prueba TechTail", cuerpo_texto="", cuerpo_html="", cuerpo="",
            destinatario="cliente@example.com", tipo="GENERICO",
        )
        enviar_email_encolado(email)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ["cliente@example.com"])
        self.assertEqual(len(mail.outbox[0].alternatives), 1)

    @override_settings(EMAIL_BACKEND="django.core.mail.backends.locmem.EmailBackend")
    @patch("apps.operaciones.services.email_service.generar_factura_pdf", return_value=b"%PDF-test")
    @patch("apps.operaciones.services.email_service._contexto_email")
    def test_factura_se_adjunta_al_email(self, contexto, _pdf):
        factura = SimpleNamespace(numero_factura="FAC-1")
        contexto.return_value = ("generico", {"mensaje": "Factura"}, factura)
        email = SimpleNamespace(
            asunto="Factura", cuerpo_texto="", cuerpo_html="", cuerpo="",
            destinatario="cliente@example.com", tipo="FACTURA_EMITIDA",
        )
        enviar_email_encolado(email)
        self.assertEqual(mail.outbox[0].attachments[0][0], "factura-FAC-1.pdf")


class ProcesarColaEmailsCommandTests(SimpleTestCase):
    @patch("apps.operaciones.management.commands.procesar_cola_emails.marcar_fallido")
    @patch("apps.operaciones.management.commands.procesar_cola_emails.marcar_enviado")
    @patch("apps.operaciones.management.commands.procesar_cola_emails.enviar_email_encolado")
    @patch("apps.operaciones.management.commands.procesar_cola_emails.reclamar_lote")
    def test_un_error_no_detiene_el_lote(self, reclamar, enviar, enviado, fallido):
        first = SimpleNamespace(cod_email=1)
        second = SimpleNamespace(cod_email=2)
        reclamar.return_value = [first, second]
        enviar.side_effect = [RuntimeError("smtp"), None]
        output = StringIO()
        call_command("procesar_cola_emails", stdout=output)
        fallido.assert_called_once()
        enviado.assert_called_once_with(second)
        self.assertIn("procesados=2 enviados=1 fallidos=1", output.getvalue().lower())
