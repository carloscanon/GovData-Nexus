CREATE TABLE IF NOT EXISTS public.data_connections (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    tenant_id UUID NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    host VARCHAR(255),
    username VARCHAR(255),
    password_encrypted VARCHAR(255),
    connection_string VARCHAR(500),
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS si se desea
ALTER TABLE public.data_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a todos en data_connections" ON public.data_connections FOR ALL USING (true) WITH CHECK (true);
