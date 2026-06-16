-- ============================================================
-- GovData Academy - Journey Progress Persistence Schema
-- Stores per-tenant, per-user progress for the CDO Journey
-- ============================================================

-- Table: journey_user_state
-- Stores sector selection, decision answers, and overall scores per user
CREATE TABLE IF NOT EXISTS journey_user_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  selected_sector TEXT,
  decision_answers JSONB DEFAULT '{}',
  decision_score INTEGER DEFAULT 0,
  db_score INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  level TEXT DEFAULT 'CDO Junior',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_email)
);

-- Table: journey_activity_progress
-- Stores per-activity completion status, evidence counts, and timestamps
CREATE TABLE IF NOT EXISTS journey_activity_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  activity_key TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  evidence_count INTEGER DEFAULT 0,
  required_count INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, user_email, activity_key)
);

-- RLS Policies
ALTER TABLE journey_user_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE journey_activity_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journey_user_state_all" ON journey_user_state FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "journey_activity_progress_all" ON journey_activity_progress FOR ALL USING (true) WITH CHECK (true);
