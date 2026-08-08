from django.core.management.base import BaseCommand

from apps.operaciones.services.email_service import (
    enviar_email_encolado,
    marcar_enviado,
    marcar_fallido,
    reclamar_lote,
)


class Command(BaseCommand):
    help = "Procesa de forma segura un lote de correos transaccionales pendientes."

    def add_arguments(self, parser):
        parser.add_argument("--limite", type=int, default=20)

    def handle(self, *args, **options):
        emails = reclamar_lote(options["limite"])
        enviados = 0
        fallidos = 0
        for email in emails:
            try:
                enviar_email_encolado(email)
                marcar_enviado(email)
                enviados += 1
            except Exception as exc:
                marcar_fallido(email, exc)
                fallidos += 1
        self.stdout.write(self.style.SUCCESS(
            f"Procesados={len(emails)} enviados={enviados} fallidos={fallidos}"
        ))
