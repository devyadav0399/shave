export type EnrichmentStatus = 'pending' | 'done' | 'retry' | 'failed';

export interface ApiLink {
  id: string;
  url: string;
  title: string | null;
  type: string | null;
  enrichment_status: EnrichmentStatus;
  enrichment_attempts: number;
  preview_image: string | null;
  summary: string | null;
  category_id: string | null;
  is_consumed: boolean;
  created_at: string;
}

export interface Link {
  id: string;
  url: string;
  title: string| null;
  type: string | null;
  enrichmentStatus: EnrichmentStatus;
  previewImage: string | null;
  summary: string | null;
  categoryId: string | null;
  isConsumed: boolean;
  createdAt: string;
}

export interface UpdateLinkPayload {
  title?: string;
  summary?: string;
  categoryId?: string;
  isConsumed?: boolean;
}
