import os
import django
import threading
from django.utils import timezone
from django.test import Client

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "TiendaRetail.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.core.models import DireccionUsuario
from apps.clientes.models import Carrito, CarritoDetalle
from apps.operaciones.models import MetodoEnvio, ZonaEntrega, Pedido
from apps.administracion.models import Producto, Categoria

User = get_user_model()

def prepare_test_data():
    user, _ = User.objects.get_or_create(email="test_concurrent@techtail.com", defaults={"nombres": "Test", "apellidos": "User", "activo": True})
    user.set_password("password123")
    user.save()

    addr, _ = DireccionUsuario.objects.get_or_create(
        cod_usuario=user,
        ciudad="Quito",
        provincia="Pichincha",
        defaults={"alias": "Casa", "receptor": "Test", "linea1": "Calle 1", "pais": "ECU", "es_predeterminada": True, "activo": True, "fecha_creacion": timezone.now()}
    )

    metodo = MetodoEnvio.objects.filter(activo=True).first()
    if not metodo:
        metodo, _ = MetodoEnvio.objects.get_or_create(nombre="Test Method", defaults={"dias_min": 1, "dias_max": 2, "costo_base": 5.0, "es_premium_gratis": False, "activo": True})

    Carrito.objects.filter(cod_usuario=user).delete()
    
    prod = Producto.objects.first()

    cart = Carrito.objects.create(cod_usuario=user, estado="ACTIVO", fecha_creacion=timezone.now(), fecha_actualizacion=timezone.now())
    CarritoDetalle.objects.create(cod_carrito=cart, cod_producto=prod, cantidad=1, precio_unitario_snapshot=100, fecha_creacion=timezone.now(), fecha_actualizacion=timezone.now())

    Pedido.objects.filter(cod_usuario=user).delete()

    return user, addr.cod_direccion, metodo.cod_metodo_envio

def worker(client, url, data, results, index):
    res = client.post(url, data)
    results[index] = res.status_code

def run_concurrent_test(user, cod_direccion, cod_metodo_envio):
    # Usar Django Test Client simulando sesión y saltando CSRF
    url = "/api/checkout/crear-pedido/"
    data = {
        "cod_direccion_envio": cod_direccion,
        "cod_metodo_envio": cod_metodo_envio
    }

    clients = [Client(enforce_csrf_checks=False, HTTP_HOST='localhost') for _ in range(3)]
    for c in clients:
        c.force_login(user)

    results = [None] * 3
    threads = []
    for i, c in enumerate(clients):
        t = threading.Thread(target=worker, args=(c, url, data, results, i))
        threads.append(t)
    
    for t in threads:
        t.start()
    for t in threads:
        t.join()

    print("HTTP Results:", results)

    pedidos = list(Pedido.objects.filter(cod_usuario=user))
    print(f"Pedidos creados: {len(pedidos)}")
    for p in pedidos:
        print(f" - Pedido #{p.cod_pedido}")
    
    if len(pedidos) > 1:
        print("BLOQUEO BACKEND CONFIRMADO: fn_crear_pedido_desde_carrito permite duplicación concurrente.")
    else:
        print("La prueba concurrente no reprodujo duplicación, pero la función sigue sin poseer una garantía de idempotencia explícita.")

if __name__ == "__main__":
    user, cod_dir, cod_metodo = prepare_test_data()
    run_concurrent_test(user, cod_dir, cod_metodo)
