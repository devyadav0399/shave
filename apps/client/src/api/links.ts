import type { ApiLink, Link, UpdateLinkPayload } from "@/types/link"

function toLink(raw: ApiLink): Link {
  return {
    id: raw.id,
    url: raw.url,
    title: raw.title,
    type: raw.type,
    enrichmentStatus: raw.enrichment_status,
    previewImage: raw.preview_image,
    summary: raw.summary,
    categoryId: raw.category_id,
    isConsumed: raw.is_consumed,
    createdAt: raw.created_at
  }
}

const getAll = async (categoryId?: string): Promise<Link[]> => {
  let query = ''
  if (categoryId) query=`?category=${categoryId}`
  const response = await fetch(`${process.env.BUN_PUBLIC_BE_URL}/links${query}`, { method: 'GET' })
  if (!response.ok) throw new Error('Failed to fetch links')
  const data: { ok: boolean, data: ApiLink[] } = await response.json()
  return data.data.map(toLink)
}

const getById = async (linkId: string): Promise<Link> => {
  const response = await fetch(`${process.env.BUN_PUBLIC_BE_URL}/links/${linkId}`, { method: 'GET' })
  if (!response.ok) throw new Error('Failed to fetch link')
  const data: { ok: boolean, data: ApiLink } = await response.json()
  return toLink(data.data)
}

const create = async (url: string): Promise<Link> => {
  const response = await fetch(`${process.env.BUN_PUBLIC_BE_URL}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({url})
  })
  if (!response.ok) throw new Error('Failed to create link')
  const data: { ok: boolean, data: ApiLink } = await response.json()
  return toLink(data.data)
}

const update = async (linkId: string, body: UpdateLinkPayload): Promise<Link> => {
  const response = await fetch(`${process.env.BUN_PUBLIC_BE_URL}/links/${linkId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!response.ok) throw new Error('Failed to update link')
  const data: { ok: boolean, data: ApiLink } = await response.json()
  return toLink(data.data)
}

export const links = {
  getAll,
  getById,
  create,
  update
}
