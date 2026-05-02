CREATE TYPE enrichment_statuses AS ENUM ('pending', 'done', 'retry', 'failed');

CREATE TABLE category (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID,
name TEXT NOT NULL,
created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
