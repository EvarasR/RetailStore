import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TiendaRetail.settings')
django.setup()

from django.test import Client

def print_result(caso, data):
    client = Client(enforce_csrf_checks=False, SERVER_NAME='127.0.0.1')
    resp = client.post('/api/auth/registro/', json.dumps(data), content_type="application/json")
    print(f"\n--- {caso} ---")
    print(f"HTTP: {resp.status_code}")
    print(f"JSON: {json.dumps(resp.json()) if resp.status_code != 500 else resp.content}")

print_result("Registro válido", {"email": "nuevo.prueba_2026@example.com", "password": "Password123!", "password2": "Password123!", "nombres": "Nuevo", "apellidos": "Prueba", "acepta": True})
print_result("Correo ya registrado", {"email": "nuevo.prueba_2026@example.com", "password": "Password123!", "password2": "Password123!", "nombres": "Nuevo", "apellidos": "Prueba", "acepta": True})
print_result("Contraseñas diferentes", {"email": "nuevo.prueba2@example.com", "password": "Password123!", "password2": "Password1234!", "nombres": "Nuevo", "apellidos": "Prueba", "acepta": True})
print_result("Contraseña corta", {"email": "nuevo.prueba3@example.com", "password": "123", "password2": "123", "nombres": "Nuevo", "apellidos": "Prueba", "acepta": True})
print_result("Términos no aceptados", {"email": "nuevo.prueba4@example.com", "password": "Password123!", "password2": "Password123!", "nombres": "Nuevo", "apellidos": "Prueba", "acepta": False})
