from io import StringIO
from unittest.mock import MagicMock, patch

from django.core.management import call_command
from django.test import SimpleTestCase


class ProcesarDescuentosWishlistCommandTests(SimpleTestCase):
    def test_invoca_funcion_oficial_y_reporta_nuevas(self):
        cursor = MagicMock()
        cursor.fetchone.return_value = (3,)
        fake_connection = MagicMock()
        fake_connection.cursor.return_value.__enter__.return_value = cursor
        fake_transaction = MagicMock()
        output = StringIO()

        with patch("apps.operaciones.management.commands.procesar_descuentos_wishlist.connection", fake_connection), patch(
            "apps.operaciones.management.commands.procesar_descuentos_wishlist.transaction", fake_transaction
        ):
            call_command("procesar_descuentos_wishlist", stdout=output)

        cursor.execute.assert_called_once_with("SELECT fn_procesar_notificaciones_descuentos_wishlist(now())")
        self.assertIn("Notificaciones nuevas: 3", output.getvalue())
