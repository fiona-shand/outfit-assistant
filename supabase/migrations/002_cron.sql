-- Calls the app every 15 minutes. The endpoint only does work once per day,
-- the first time it runs at/after 7 a.m. in your saved timezone, so this
-- handles daylight saving and travel automatically.
--
-- BEFORE RUNNING: replace YOUR-APP-URL and YOUR-CRON-SECRET below.

create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'outfit-assistant-daily',
  '*/15 * * * *',
  $$
  select net.http_post(
    url := 'https://YOUR-APP-URL/api/cron/daily',
    headers := jsonb_build_object(
      'Authorization', 'Bearer YOUR-CRON-SECRET',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 120000
  );
  $$
);

-- To remove later: select cron.unschedule('outfit-assistant-daily');
