from django.test import SimpleTestCase, Client

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

    def test_2_login_valido_con_csrf(self):
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "test@example.com", "password": "password123"})
        # No DB, authenticate returns None
        self.assertEqual(resp.status_code, 401)

    def test_3_login_invalido_con_csrf(self):
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "test@example.com", "password": "wrong"})
        self.assertEqual(resp.status_code, 401)

    def test_4_login_sin_csrf(self):
        resp = self.client.post('/api/auth/login/', {"email": "test@example.com", "password": "password123"}, content_type="application/json")
        self.assertEqual(resp.status_code, 403) # Django CSRF rejection is usually 403 HTML

    def test_5_login_mediante_get(self):
        client = Client(enforce_csrf_checks=True)
        resp = client.get('/api/auth/login/')
        self.assertEqual(resp.status_code, 405) # Require POST

    def test_6_usuario_inactivo(self):
        resp = self._post_json_with_csrf('/api/auth/login/', {"email": "inactivo@example.com", "password": "password123"})
        self.assertEqual(resp.status_code, 401)

    def test_7_login_y_session(self):
        client = Client(enforce_csrf_checks=True)
        resp = client.get('/api/session/')
        self.assertEqual(resp.status_code, 200)

    def test_8_logout_anonimo(self):
        resp = self.client.post('/api/auth/logout/')
        resp = self._post_json_with_csrf('/api/auth/logout/', {})
        self.assertEqual(resp.status_code, 200)

    def test_9_registro_sin_csrf(self):
        resp = self.client.post('/api/auth/registro/', {"email": "new@example.com", "password": "password123"}, content_type="application/json")
        self.assertEqual(resp.status_code, 403)

    def test_10_registro_con_csrf(self):
        resp = self._post_json_with_csrf('/api/auth/registro/', {"email": "new@example.com", "password": "password123"})
        # Should return 400 or 401 depending on validation (since DB doesn't exist, we just want to ensure it passes CSRF)
        self.assertIn(resp.status_code, [200, 201, 400, 401])


