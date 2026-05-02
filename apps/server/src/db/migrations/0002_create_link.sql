CREATE TABLE link (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID,
url TEXT NOT NULL,
title TEXT,
type TEXT,
enrichment_status enrichment_statuses NOT NULL DEFAULT 'pending',
enrichment_attempts INTEGER DEFAULT 0,
preview_image TEXT,
summary TEXT,
category_id UUID REFERENCES category(id) ON DELETE SET NULL,
is_consumed BOOLEAN DEFAULT FALSE,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
