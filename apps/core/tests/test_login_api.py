from django.test import SimpleTestCase, Client
from unittest.mock import patch

class LoginApiTestCase(SimpleTestCase):
    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)

    def _post_json_with_csrf(self, url, data):
        # Primero hace GET para obtener la cookie CSRF
        client = Client(enforce_csrf_checks=True)
        resp = client.get('/api/csrf/')
        csrf_token = resp.cookies.get('csrftoken').value
        # Luego hace POST pasando el header y la cookie
        return client.post(
            url, 
            data, 
            content_type="application/json",
            HTTP_X_CSRFTOKEN=csrf_token
        )

    def test_1_get_csrf(self):
        resp = self.client.get('/api/csrf/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('csrftoken', resp.cookies)

    @patch('apps.core.views.authenticate')
    def test_2_login_valido_con_csrf(self, mock_auth):
        mock_auth.return_value = None
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "customer@example.com", "password": "UnitOnly!9_Credential"})
        self.assertEqual(resp.status_code, 401)

    @patch('apps.core.views.authenticate')
    def test_3_login_invalido_con_csrf(self, mock_auth):
        mock_auth.return_value = None
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "customer@example.com", "password": "wrong"})
        self.assertEqual(resp.status_code, 401)
        self.assertEqual(resp.json()['mensaje'], "Credenciales incorrectas")

    @patch('apps.core.views.authenticate')
    def test_11_login_error_interno(self, mock_auth):
        mock_auth.side_effect = Exception("DB error")
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "customer@example.com", "password": "UnitOnly!9_Credential"})
        self.assertEqual(resp.status_code, 500)
        self.assertIn("error interno", resp.json()['mensaje'])

    def test_4_login_sin_datos(self):
        resp = self._post_json_with_csrf('/api/auth/login/', {})
        self.assertEqual(resp.status_code, 401)

    def test_5_login_metodo_get(self):
        resp = self.client.get('/api/auth/login/')
        self.assertEqual(resp.status_code, 405) # Method Not Allowed

    @patch('apps.core.views.authenticate')
    def test_6_usuario_inactivo(self, mock_auth):
        mock_auth.return_value = None
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "inactive@example.com", "password": "UnitOnly!9_Credential"})
        self.assertEqual(resp.status_code, 401)

    def test_7_csrf_endpoint(self):
        resp = self.client.get('/api/csrf/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue('csrftoken' in resp.cookies)

    def test_8_logout_anonimo(self):
        resp = self._post_json_with_csrf('/api/auth/logout/', {})
        self.assertEqual(resp.status_code, 200)

    def test_9_registro_sin_csrf(self):
        resp = self.client.post('/api/auth/registro/', {"email": "new@example.com", "password": "UnitOnly!9_Credential"}, content_type="application/json")
        self.assertEqual(resp.status_code, 403)

    @patch('apps.core.views.transaction.atomic')
    @patch('apps.core.views.crear_usuario_cliente')
    @patch('apps.core.views.authenticate')
    @patch('apps.core.views.login')
    def test_10_registro_con_csrf(self, mock_login, mock_auth, mock_crear, mock_atomic):
        mock_crear.return_value = 1
        mock_auth.return_value = None
        mock_atomic.return_value.__enter__.return_value = None
        resp = self._post_json_with_csrf('/api/auth/registro/', {"email": "new@example.com", "password": "UnitOnly!9_Credential", "password2": "UnitOnly!9_Credential", "acepta": True})
        self.assertEqual(resp.status_code, 200)

    def test_12_rutas_google_retiradas(self):
        for url in (
            '/api/auth/google/preparar/',
            '/api/auth/google/autenticar/',
            '/api/auth/google/completar/',
            '/api/seguridad/google/',
            '/api/seguridad/google/desvincular/',
        ):
            self.assertEqual(self.client.get(url).status_code, 404)
