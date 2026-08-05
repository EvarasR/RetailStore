from unittest.mock import patch

from django.test import SimpleTestCase

from apps.administracion.services.panel_service import listar_entidad


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
