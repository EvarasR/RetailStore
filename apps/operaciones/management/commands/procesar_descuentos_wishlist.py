from django.core.management.base import BaseCommand
from django.db import connection, transaction


class Command(BaseCommand):
    help = "Genera notificaciones idempotentes para descuentos vigentes y productos en wishlist."

    def handle(self, *args, **options):
        with transaction.atomic(), connection.cursor() as cursor:
            cursor.execute("SELECT fn_procesar_notificaciones_descuentos_wishlist(now())")
            total = int(cursor.fetchone()[0] or 0)
        self.stdout.write(self.style.SUCCESS(f"Notificaciones nuevas: {total}"))
