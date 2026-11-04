-- Applied migration: add_expiring_owner_admin_sessions
create table if not exists public.chaeum_admin_sessions (token_hash text primary key, expires_at timestamptz not null);
alter table public.chaeum_admin_sessions enable row level security;
revoke all on public.chaeum_admin_sessions from public, anon, authenticated;
grant select,insert,delete on public.chaeum_admin_sessions to service_role;
create index if not exists chaeum_admin_sessions_expiry on public.chaeum_admin_sessions(expires_at);
