# Acceso con Google: configuración y seguridad

La implementación usa Google Identity Services (GIS) en modo ID token. El
navegador obtiene `credential`; Django valida firma, issuer, audiencia,
expiración, `email_verified`, `sub` y el `nonce` emitido por el servidor. El
`state` de sesión es de un solo uso, expira a los cinco minutos y `next` solo
acepta rutas internas.

## Google Cloud Console

1. Configura la pantalla de consentimiento OAuth.
2. Crea un cliente **Web application**.
3. Añade orígenes JavaScript autorizados:
   - `http://127.0.0.1:5173`
   - `http://localhost:5173` si realmente se usa ese hostname
   - `https://tienda.example.com` en producción
4. En este flujo popup no existe URI de redirección OAuth: el callback de GIS
   es JavaScript y entrega el token al endpoint same-origin
   `POST /api/auth/google/autenticar/`. No añadas un callback ficticio.

Variables requeridas:

```dotenv
GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=000000000000-example.apps.googleusercontent.com
```

Ambos IDs deben ser idénticos. Este flujo no usa `GOOGLE_CLIENT_SECRET`, por lo
que no se configura ni se expone uno. Después de cambiar una variable `VITE_*`
hay que reconstruir el frontend.

## Vinculación de cuentas

- Un cliente existente con email verificado puede vincularse por primera vez.
- Una identidad `(provider, subject)` solo pertenece a un usuario.
- Cuentas privilegiadas existentes no se vinculan automáticamente por email;
  deben iniciar sesión y hacerlo desde **Seguridad y acceso**.
- Un usuario nuevo recibe únicamente el rol `CUSTOMER` y completa nombres y
  apellidos si Google no los proporciona.
- Para desvincular Google debe existir una contraseña local utilizable, evitando
  dejar la cuenta inaccesible.

Las rutas de estado, enlace y desvinculación mantienen la sesión Django y la
protección CSRF existentes. No se persisten access tokens ni refresh tokens.

## Validación de producción

Comprueba registro nuevo, login repetido, vinculación de cliente existente,
rechazo de `nonce`/audiencia inválidos, cancelación del popup, cuenta Google ya
usada y desvinculación con y sin contraseña. Verifica además cookies `Secure`,
HTTPS y que los logs no contengan el ID token.
