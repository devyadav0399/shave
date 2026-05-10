import type { ApiCategory, Category } from "@/types/category";

function toCategory(raw: ApiCategory): Category {
  return {
    id: raw.id,
    name: raw.name,
    createdAt: raw.created_at
  }
}

const getAll = async (): Promise<Category[]> => {
  const response = await fetch(`${process.env.BUN_PUBLIC_BE_URL}/categories`, { method: 'GET' })
  if (!response.ok) throw new Error('Failed to fetch categories')
  const data: { ok: boolean, data: ApiCategory[] } = await response.json()
  return data.data.map(toCategory)
}

const create = async (name: string): Promise<Category> => {
  const response = await fetch(`${process.env.BUN_PUBLIC_BE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({name})
  })
  if (!response.ok) throw new Error('Failed to create category')
  const data: { ok: boolean, data: ApiCategory } = await response.json()
  return toCategory(data.data)
}

export const categories = {
  getAll,
  create
}
