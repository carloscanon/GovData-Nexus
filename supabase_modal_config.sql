CREATE TABLE IF NOT EXISTS tenant_modal_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    config_key VARCHAR(100) NOT NULL DEFAULT 'global',
    config_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by TEXT,
    CONSTRAINT unique_tenant_config_key UNIQUE(tenant_id, config_key)
);
