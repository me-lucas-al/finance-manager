-- Daily spending analysis job (plano_migracao.xml, tarefa 6).
-- Review before applying manually in the Supabase SQL editor.
--
-- Manual steps required first (cannot be scripted from here):
-- 1. Deploy the function: supabase functions deploy analyze-spending --no-verify-jwt
-- 2. Enable pg_cron and pg_net (Database > Extensions in the dashboard, or the
--    `create extension` statements below if your plan allows it via SQL).
-- 3. Store the project URL and an API key in Vault so this migration never
--    hardcodes a secret (Project Settings > Vault, or via SQL):
--      select vault.create_secret('https://<project-ref>.supabase.co', 'project_url');
--      select vault.create_secret('<anon-or-service-role-key>', 'analyze_spending_api_key');

create extension if not exists pg_cron;
create extension if not exists pg_net;

select
  cron.schedule(
    'analyze-spending-daily',
    '0 12 * * *', -- once a day, 12:00 UTC — adjust to your timezone if needed
    $$
    select
      net.http_post(
        url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/analyze-spending',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'apikey', (select decrypted_secret from vault.decrypted_secrets where name = 'analyze_spending_api_key')
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 30000
      ) as request_id;
    $$
  );
