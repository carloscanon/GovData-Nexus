-- Create normativas_evaluations table
CREATE TABLE IF NOT EXISTS public.normativas_evaluations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    connection_id UUID REFERENCES public.data_connections(id) ON DELETE CASCADE,
    normativa_id VARCHAR(255) NOT NULL,
    checklist_state JSONB NOT NULL DEFAULT '{}'::jsonb,
    cumplimiento_pct INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, connection_id, normativa_id)
);

-- Enable RLS
ALTER TABLE public.normativas_evaluations ENABLE ROW LEVEL SECURITY;

-- Create permissive policy for MVP
CREATE POLICY "Permitir todo a todos en normativas_evaluations" ON public.normativas_evaluations FOR ALL USING (true) WITH CHECK (true);
