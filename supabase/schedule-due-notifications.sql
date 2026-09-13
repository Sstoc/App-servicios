-- ==============================================================================
-- PROGRAMACIÓN DE NOTIFICACIONES AUTOMÁTICAS (App Servicios)
-- Ejecutar este script en el SQL Editor de Supabase (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Habilitar extensiones necesarias (pg_cron para tareas programadas y pg_net para invocar la Edge Function)
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- 2. Limpiar secretos antiguos en Vault si ya existían para evitar duplicados
delete from vault.secrets where name in ('push_project_url', 'push_cron_secret');

-- 3. Guardar la URL del proyecto y el secreto del cron de forma segura en Vault
select vault.create_secret('https://crxnuxqiguudwxlmswxe.supabase.co', 'push_project_url');
select vault.create_secret('eJeZptZqV2qktHnQBp0TFhd2JjGvLD3K5z4BCnfnRgc', 'push_cron_secret');

-- 4. Desprogramar cualquier versión previa del job si existía
do $$
begin
  if exists (select 1 from cron.job where jobname = 'send-due-notifications') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'send-due-notifications';
  end if;
end $$;

-- 5. Programar la ejecución automática diaria:
--    '0 12 * * *' = 12:00 UTC, equivalente a las 09:00 AM hora Argentina (America/Argentina/Buenos_Aires)
select cron.schedule(
  'send-due-notifications',
  '0 12 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'push_project_url')
      || '/functions/v1/send-due-notifications',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'push_cron_secret')
    ),
    body := '{}'::jsonb
  );
  $$
);
