ALTER TABLE gov_committee_documents ADD COLUMN IF NOT EXISTS topic TEXT;
ALTER TABLE gov_committee_documents ADD COLUMN IF NOT EXISTS meeting_date TIMESTAMPTZ DEFAULT now();
