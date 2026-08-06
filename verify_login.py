import os
import django
import json
import traceback

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TiendaRetail.settings')
django.setup()

from django.test import Client

def print_login(email, password):
    client = Client(enforce_csrf_checks=False, SERVER_NAME='127.0.0.1')
    try:
        resp = client.post('/api/auth/login/', json.dumps({"email": email, "password": password}), content_type="application/json")
        print(f"\n--- {email} ---")
        print(f"HTTP: {resp.status_code}")
        print(f"JSON: {json.dumps(resp.json()) if resp.status_code != 500 else resp.content}")
    except Exception as e:
        print(f"\n--- {email} ---")
        print(traceback.format_exc())

print_login("admin@retailprime.local", "TestPass123!")
