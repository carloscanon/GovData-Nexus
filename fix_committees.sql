-- Fix gov_committees table and tenant_users RLS
ALTER TABLE IF EXISTS gov_committees ADD COLUMN IF NOT EXISTS owner TEXT;

-- Disable RLS temporarily on these tables so the demo MVP works without complex JWT policies
ALTER TABLE IF EXISTS gov_committees DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tenant_users DISABLE ROW LEVEL SECURITY;
