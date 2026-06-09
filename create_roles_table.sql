-- Create roles table for RBAC system
-- Simplified version without auth.users FK (tenant_users handles user identity)

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenant_config(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz default now(),
  unique (tenant_id, name)
);

-- Role-Modules mapping (module = route slug like 'dashboard', 'catalog', etc.)
create table if not exists public.role_modules (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  module text not null,
  unique (role_id, module)
);

-- User-Roles mapping (uses tenant_users.id instead of auth.users)
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.tenant_users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  unique (user_id, role_id)
);

-- Add is_role_manager to tenant_users if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenant_users' AND column_name = 'is_role_manager'
  ) THEN
    ALTER TABLE public.tenant_users ADD COLUMN is_role_manager boolean DEFAULT false;
  END IF;
END $$;

-- Indexes
create index if not exists idx_roles_tenant on public.roles(tenant_id);
create index if not exists idx_role_modules_role on public.role_modules(role_id);
create index if not exists idx_user_roles_user on public.user_roles(user_id);
create index if not exists idx_user_roles_role on public.user_roles(role_id);

-- RLS Policies
alter table public.roles enable row level security;
alter table public.role_modules enable row level security;
alter table public.user_roles enable row level security;

-- Allow all operations for authenticated users (anon key with service role can also work)
create policy "Allow all on roles" on public.roles for all using (true) with check (true);
create policy "Allow all on role_modules" on public.role_modules for all using (true) with check (true);
create policy "Allow all on user_roles" on public.user_roles for all using (true) with check (true);
