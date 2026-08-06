import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'TiendaRetail.settings')
django.setup()

from django.test import Client
from apps.core.models import Usuario

USERS_TO_TEST = [
    ("CUSTOMER", "ana.cliente@example.com", "TestPass123!"),
    ("PREMIUM_CUSTOMER", "carla.prime@example.com", "TestPass123!"),
    ("ADMIN", "admin@retailprime.local", "TestPass123!"),
    ("WAREHOUSE_MANAGER", "bodega@retailprime.local", "TestPass123!"),
    ("SUPPLIER_MANAGER", "proveedores@retailprime.local", "TestPass123!"),
    ("SUPPORT", "soporte@retailprime.local", "TestPass123!"),
    ("PROVEEDOR_EXTERNO", "proveedor_test@example.com", "TestPass123!"),
]

def print_result(persona, email, login_status, login_json, session_json):
    print(f"\n--- {persona} ---")
    if login_status == -1:
         print("NO_EJECUTADA (Usuario no existe)")
         return
    print(f"Login HTTP: {login_status}")
    print(f"Login JSON: {json.dumps(login_json)}")
    if session_json:
         print(f"Session HTTP: 200")
         print(f"Session JSON: {json.dumps(session_json)}")

for persona, email, default_password in USERS_TO_TEST:
    try:
        user = Usuario.objects.get(email=email)
        # Using Client to simulate frontend
        client = Client(enforce_csrf_checks=False, SERVER_NAME='127.0.0.1')
        
        resp = client.post('/api/auth/login/', json.dumps({"email": email, "password": default_password}), content_type="application/json")
        login_status = resp.status_code
        login_json = resp.json() if resp.status_code in [200, 201, 400, 401, 403, 500] else None
        
        session_json = None
        if login_status == 200:
             sess_resp = client.get('/api/session/')
             session_json = sess_resp.json() if sess_resp.status_code == 200 else None
             
        print_result(persona, email, login_status, login_json, session_json)
    except Usuario.DoesNotExist:
        print_result(persona, email, -1, None, None)
