export interface ApiCategory {
  id: string;
  name: string;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export type CategoryMap = Record<string, string>
