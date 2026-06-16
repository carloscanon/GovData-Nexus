CREATE TABLE IF NOT EXISTS simulator_user_step_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_email TEXT NOT NULL,
    step_key TEXT NOT NULL,
    module_id TEXT REFERENCES simulator_modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, user_email, step_key)
);

ALTER TABLE simulator_user_step_progress DISABLE ROW LEVEL SECURITY;
