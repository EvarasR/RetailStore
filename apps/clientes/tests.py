import json
from types import SimpleNamespace
from unittest.mock import patch

from django.test import RequestFactory, SimpleTestCase

from apps.clientes.views import api_crear_resena_producto


class CrearResenaProductoApiTests(SimpleTestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.usuario = SimpleNamespace(is_authenticated=True, cod_usuario=17)

    @patch("apps.clientes.views.crear_resena_producto", return_value=91)
    def test_crea_resena_pendiente_con_datos_validos(self, crear_resena):
        request = self.factory.post(
            "/api/productos/8/resenas/crear/",
            {"calificacion": "5", "titulo": "Excelente", "comentario": "Funciona muy bien en mi red."},
        )
        request.user = self.usuario

        response = api_crear_resena_producto(request, 8)
        payload = json.loads(response.content)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(payload["ok"])
        self.assertEqual(payload["estado"], "PENDIENTE")
        crear_resena.assert_called_once_with(17, 8, 5, "Excelente", "Funciona muy bien en mi red.")

    @patch("apps.clientes.views.crear_resena_producto")
    def test_rechaza_calificacion_invalida_sin_invocar_sql(self, crear_resena):
        request = self.factory.post(
            "/api/productos/8/resenas/crear/",
            {"calificacion": "7", "comentario": "Comentario suficientemente largo."},
        )
        request.user = self.usuario

        response = api_crear_resena_producto(request, 8)

        self.assertEqual(response.status_code, 400)
        crear_resena.assert_not_called()

    @patch(
        "apps.clientes.views.crear_resena_producto",
        side_effect=Exception("Solo puedes reseñar productos de pedidos entregados."),
    )
    def test_informa_si_no_existe_compra_entregada(self, _crear_resena):
        request = self.factory.post(
            "/api/productos/8/resenas/crear/",
            {"calificacion": "4", "comentario": "Comentario suficientemente largo."},
        )
        request.user = self.usuario

        response = api_crear_resena_producto(request, 8)
        payload = json.loads(response.content)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(payload["mensaje"], "Solo puedes reseñar productos de pedidos entregados.")
