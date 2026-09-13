# Notificaciones con la PWA cerrada

El cliente guarda una suscripción Web Push por dispositivo en `push_subscriptions`.
Una función programada consulta las facturas pendientes que vencen hoy, mañana o pasado y envía el push aunque la PWA no esté abierta.

## Configuración única

1. Generá las claves una sola vez con `node scripts/generate-vapid.mjs`. No publiques la clave privada.
2. Copiá la clave pública en `.env.production.local` como `VITE_VAPID_PUBLIC_KEY=...` antes de compilar/publicar el frontend.
3. Aplicá `migrations/20260906_create_push_subscriptions.sql` en el SQL Editor de Supabase.
4. Guardá estos secretos en Supabase Edge Functions:

   - `VAPID_SUBJECT` (por ejemplo `mailto:tu-correo@ejemplo.com`)
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `PUSH_CRON_SECRET` (una cadena larga y aleatoria)

5. Desplegá `send-due-notifications` y ejecutá `schedule-due-notifications.sql`, reemplazando el proyecto y el mismo `PUSH_CRON_SECRET`.

La función está protegida por el secreto del cron; las claves privadas no se envían al navegador.
