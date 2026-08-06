import json
from unittest.mock import patch, MagicMock
from django.test import SimpleTestCase, Client
from django.urls import reverse

class AislamientoProveedorTestCase(SimpleTestCase):
    def setUp(self):
        self.client = Client()

    @patch('apps.proveedores.services.portal_service.es_usuario_proveedor')
    @patch('apps.proveedores.services.portal_service.obtener_proveedor_usuario')
    def test_sesion_anonimo(self, mock_obtener, mock_es):
        response = self.client.get('/api/session/')
        data = response.json()
        self.assertFalse(data.get('autenticado'))

    @patch('apps.proveedores.services.portal_service.es_usuario_proveedor')
    @patch('apps.proveedores.services.portal_service.obtener_proveedor_usuario')
    def test_sesion_customer(self, mock_obtener, mock_es):
        pass

class AislamientoServiceTestCase(SimpleTestCase):
    @patch('apps.proveedores.services.portal_service.UsuarioProveedor.objects.filter')
    def test_es_usuario_proveedor_externo(self, mock_filter):
        from apps.proveedores.services.portal_service import es_usuario_proveedor
        
        # Simular que tiene asociacion
        mock_qs = MagicMock()
        mock_qs.exists.return_value = True
        mock_filter.return_value = mock_qs
        
        self.assertTrue(es_usuario_proveedor(MagicMock()))
        
        # Simular que NO tiene
        mock_qs.exists.return_value = False
        self.assertFalse(es_usuario_proveedor(MagicMock()))

    @patch('apps.proveedores.services.portal_service.obtener_proveedor_usuario')
    @patch('apps.proveedores.services.portal_service.es_usuario_proveedor')
    def test_puede_gestionar_proveedor(self, mock_es_prov, mock_obtener):
        from apps.proveedores.services.portal_service import puede_gestionar_proveedor
        
        user_mock = MagicMock()
        user_mock.is_staff = False
        
        prov_mock = MagicMock()
        prov_mock.cod_proveedor = 100
        
        # Escenario 1: Tiene asociación y el código coincide
        mock_obtener.return_value = prov_mock
        mock_es_prov.return_value = True
        
        self.assertTrue(puede_gestionar_proveedor(user_mock, 100))
        
        # Escenario 2: Intenta acceder a otro proveedor
        self.assertFalse(puede_gestionar_proveedor(user_mock, 200))
        
        # Escenario 3: No es proveedor
        mock_es_prov.return_value = False
        self.assertFalse(puede_gestionar_proveedor(user_mock, 100))

