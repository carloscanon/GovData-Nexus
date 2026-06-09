/* 20240609_create_rbac.sql */
-- Migration: create role‑based access control tables scoped per tenant
-- Run with: supabase db push

-- 1. Roles table
create table public.roles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenant_config(id) on delete cascade,
  name text not null,
  description text,
  unique (tenant_id, name)
);

-- 2. Role‑Modules mapping (module = route slug)
create table public.role_modules (
  role_id uuid not null references public.roles(id) on delete cascade,
  module text not null,
  primary key (role_id, module)
);

-- 3. User‑Roles mapping
create table public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (user_id, role_id)
);

-- 4. Extend tenant_users with role manager flag (optional delegación)
alter table public.tenant_users
  add column is_role_manager boolean default false;

-- 5. Indexes for fast lookup
create index idx_role_modules_module on public.role_modules(module);
create index idx_user_roles_user on public.user_roles(user_id);

-- 6. Optional: seed a default admin role per tenant (run manually if needed)
-- insert into public.roles (tenant_id, name, description) values (<tenant-id>, 'admin', 'Full access role');
