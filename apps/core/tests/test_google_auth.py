from unittest.mock import patch

from django.test import Client, SimpleTestCase, override_settings

from apps.core.services.google_auth_service import GoogleAuthError, desvincular_google, verificar_credencial_google


class GoogleTokenTests(SimpleTestCase):
    @override_settings(GOOGLE_CLIENT_ID="client-id.apps.googleusercontent.com")
    @patch("apps.core.services.google_auth_service.id_token.verify_oauth2_token")
    def test_valida_audience_issuer_email_sub_y_nonce(self, verify):
        verify.return_value = {
            "iss": "https://accounts.google.com", "aud": "client-id.apps.googleusercontent.com",
            "sub": "google-sub", "email": "user@example.com", "email_verified": True,
            "nonce": "expected-nonce",
        }
        claims = verificar_credencial_google("opaque-token", "expected-nonce")
        self.assertEqual(claims["sub"], "google-sub")

    @override_settings(GOOGLE_CLIENT_ID="client-id.apps.googleusercontent.com")
    @patch("apps.core.services.google_auth_service.id_token.verify_oauth2_token")
    def test_rechaza_nonce_invalido(self, verify):
        verify.return_value = {
            "iss": "accounts.google.com", "sub": "google-sub", "email": "user@example.com",
            "email_verified": True, "nonce": "different",
        }
        with self.assertRaisesMessage(GoogleAuthError, "seguridad"):
            verificar_credencial_google("opaque-token", "expected")

    def test_no_desvincula_si_dejaria_usuario_sin_acceso(self):
        user = type("User", (), {"has_usable_password": lambda self: False})()
        with self.assertRaisesMessage(GoogleAuthError, "contraseña"):
            desvincular_google(user)


@override_settings(SESSION_ENGINE="django.contrib.sessions.backends.signed_cookies")
class GoogleFlowApiTests(SimpleTestCase):
    def _client_with_csrf(self):
        client = Client(enforce_csrf_checks=True)
        response = client.get("/api/csrf/")
        return client, response.cookies["csrftoken"].value

    @override_settings(GOOGLE_CLIENT_ID="client-id.apps.googleusercontent.com")
    def test_next_externo_no_se_guarda(self):
        client, csrf = self._client_with_csrf()
        response = client.post(
            "/api/auth/google/preparar/", {"mode": "login", "next": "https://malicioso.com"},
            content_type="application/json", HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(response.status_code, 200)
        self.assertIsNone(client.session["google_oidc_flow"]["next"])

    @override_settings(GOOGLE_CLIENT_ID="client-id.apps.googleusercontent.com")
    def test_state_invalido_se_rechaza_antes_del_token(self):
        client, csrf = self._client_with_csrf()
        client.post(
            "/api/auth/google/preparar/", {"mode": "login"},
            content_type="application/json", HTTP_X_CSRFTOKEN=csrf,
        )
        response = client.post(
            "/api/auth/google/autenticar/", {"state": "incorrecto", "credential": "opaque"},
            content_type="application/json", HTTP_X_CSRFTOKEN=csrf,
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["codigo"], "GOOGLE_INVALID_STATE")
