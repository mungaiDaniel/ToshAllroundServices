-- =====================================================================================
-- Tosh Allround Services – privacy-friendly activity counters (run AFTER 001_init.sql)
--
-- Only anonymous DAILY COUNTERS are stored (e.g. "2025-03-04 / view / /leistungen = 17").
-- No IP address, no user agent, no visitor id, no cookie, no timestamp per visit. Nothing in this
-- table can be traced back to a person. Safe to run more than once.
-- =====================================================================================

create table if not exists public.activity_daily (
  day   date not null,
  kind  text not null,
  key   text not null,
  count integer not null default 0,
  primary key (day, kind, key)
);

alter table public.activity_daily enable row level security;

drop policy if exists "admin read activity" on public.activity_daily;
create policy "admin read activity" on public.activity_daily for select to authenticated using (public.is_admin());

revoke all on public.activity_daily from anon, authenticated;
grant select on public.activity_daily to authenticated;

-- Visitors can only call this function. It accepts a fixed list of (kind, key) pairs and silently ignores
-- everything else, so the table can never grow beyond a few dozen rows per day.
create or replace function public.track_event(p_kind text, p_key text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    (p_kind = 'view'   and p_key in ('/', '/ueber-uns', '/leistungen', '/galerie', '/kontakt', '/impressum', '/datenschutz', 'other')) or
    (p_kind = 'click'  and p_key in ('whatsapp', 'phone', 'email', 'maps', 'cv', 'language')) or
    (p_kind = 'device' and p_key in ('mobile', 'desktop')) or
    (p_kind = 'lang'   and p_key in ('de', 'en')) or
    (p_kind = 'source' and p_key in ('direct', 'search', 'social', 'other'))
  ) then
    return;
  end if;

  insert into public.activity_daily (day, kind, key, count)
  values ((now() at time zone 'Europe/Berlin')::date, p_kind, p_key, 1)
  on conflict (day, kind, key) do update set count = public.activity_daily.count + 1;
end;
$$;

revoke all on function public.track_event(text, text) from public;
grant execute on function public.track_event(text, text) to anon, authenticated;

-- ---------- privacy: keep counters for 24 months -----------------------------------
do $$
begin
  create extension if not exists pg_cron;
  perform cron.unschedule(jobid) from cron.job where jobname = 'delete-old-activity';
  perform cron.schedule(
    'delete-old-activity',
    '23 3 * * *',
    $job$delete from public.activity_daily where day < current_date - 730$job$
  );
exception when others then
  raise notice 'pg_cron is not enabled, so old activity counters will NOT be deleted automatically: %', sqlerrm;
end $$;
