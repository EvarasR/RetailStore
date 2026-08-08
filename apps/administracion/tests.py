from io import BytesIO
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import SimpleTestCase, override_settings
from PIL import Image

from apps.administracion.services.panel_service import listar_entidad
from apps.administracion.services.producto_service import detalle_precio_producto
from apps.administracion.views import _guardar_archivo_producto


class ListarEntidadTests(SimpleTestCase):
    @patch(
        "apps.administracion.services.panel_service.ejecutar_funcion_scalar",
        return_value='[{"cod_producto": 4, "nombre": "Switch"}]',
    )
    def test_convierte_jsonb_serializado_por_postgresql(self, ejecutar):
        registros = listar_entidad("producto", False)

        self.assertEqual(registros, [{"cod_producto": 4, "nombre": "Switch"}])
        ejecutar.assert_called_once_with(
            "fn_listar_entidad_administrable",
            ["producto", False],
            ["TEXT", "BOOLEAN"],
        )

    @patch(
        "apps.administracion.services.panel_service.ejecutar_funcion_scalar",
        return_value=[{"cod_categoria": 2, "nombre": "Redes"}],
    )
    def test_conserva_lista_ya_decodificada(self, _ejecutar):
        self.assertEqual(
            listar_entidad("categoria"),
            [{"cod_categoria": 2, "nombre": "Redes"}],
        )

    @patch(
        "apps.administracion.services.panel_service.ejecutar_funcion_scalar",
        return_value="json inválido",
    )
    def test_json_invalido_no_rompe_el_dashboard(self, _ejecutar):
        self.assertEqual(listar_entidad("producto"), [])


class ArchivoProductoTests(SimpleTestCase):
    def test_rechaza_pdf_con_extension_correcta_y_contenido_falso(self):
        archivo = SimpleUploadedFile("ficha.pdf", b"esto no es un pdf", content_type="application/pdf")
        with self.assertRaisesMessage(ValueError, "PDF válido"):
            _guardar_archivo_producto(archivo, 10, "FICHA")

    def test_rechaza_imagen_si_mime_y_extension_no_coinciden(self):
        archivo = SimpleUploadedFile("foto.png", b"contenido falso", content_type="text/plain")
        with self.assertRaisesMessage(ValueError, "MIME de imagen"):
            _guardar_archivo_producto(archivo, 10, "IMAGEN")

    def test_guarda_png_valido_en_ruta_aislada_y_segura(self):
        buffer = BytesIO()
        Image.new("RGB", (2, 2), "blue").save(buffer, format="PNG")
        archivo = SimpleUploadedFile("../../foto.png", buffer.getvalue(), content_type="image/png")
        with TemporaryDirectory() as media_root, override_settings(MEDIA_ROOT=media_root, MEDIA_URL="/media/"):
            url = _guardar_archivo_producto(archivo, 42, "IMAGEN")
            self.assertTrue(url.startswith("/media/productos/42/imagenes/"))
            self.assertNotIn("..", url)
            self.assertTrue(Path(media_root, url.removeprefix("/media/")).exists())


class DetallePrecioProductoTests(SimpleTestCase):
    @patch(
        "apps.administracion.services.producto_service.ejecutar_funcion_scalar",
        return_value='{"precio_normal": 100, "precio_final": 80, "tiene_descuento": true}',
    )
    def test_decodifica_jsonb_serializado_por_driver(self, _ejecutar):
        detalle = detalle_precio_producto(7)
        self.assertEqual(detalle["precio_final"], 80)
        self.assertTrue(detalle["tiene_descuento"])
