# Despliegue de producción sin Docker

Stack objetivo: AlmaLinux 9, Nginx, Gunicorn, Django, PostgreSQL 15 y build estático de Vite bajo HTTPS.

## Preparación

```bash
python3 -m venv entorno
./entorno/bin/python -m pip install -r requirements-prod.txt
cd frontend
npm ci
npm run lint
npm run test
npm run build
cd ..
./entorno/bin/python manage.py check
./entorno/bin/python manage.py collectstatic --noinput
```

Variables mínimas: `SECRET_KEY`, `DEBUG=False`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `ALLOWED_HOSTS`, `CSRF_TRUSTED_ORIGINS`, `SECURE_SSL_REDIRECT=True`, `SESSION_COOKIE_SECURE=True`, `CSRF_COOKIE_SECURE=True`, `SECURE_HSTS_SECONDS`, `SECURE_HSTS_INCLUDE_SUBDOMAINS=True`. El dominio se configura por entorno, nunca en código.

Ejemplo de servicio Gunicorn (`WorkingDirectory` y usuario son ilustrativos):

```ini
[Unit]
Description=TechTail Gunicorn
After=network.target

[Service]
User=techtail
Group=nginx
WorkingDirectory=/srv/techtail
EnvironmentFile=/srv/techtail/.env
ExecStart=/srv/techtail/entorno/bin/gunicorn --workers 3 --bind unix:/run/techtail.sock TiendaRetail.wsgi:application
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Ejemplo Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name tienda.example.com;

    root /srv/techtail/frontend/dist;
    index index.html;

    location ~ ^/(api|panel/api|proveedores/api|operaciones/api)/ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_pass http://unix:/run/techtail.sock;
    }

    location /media/ { alias /srv/techtail/media/; }
    location /static/ { alias /srv/techtail/staticfiles/; }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Las ubicaciones API deben declararse antes del fallback SPA. Nginx termina TLS y envía `X-Forwarded-Proto`; Django tiene `SECURE_PROXY_SSL_HEADER` configurado. Los certificados y secretos se administran fuera del repositorio.
