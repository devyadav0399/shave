import pool from "../../db/client"
import type { Link, UpdateLinkPayload } from "../../types/link"
import { patchLinkQuery } from "../../utils/linkQueryBuilder";
import type { EnrichedMetadata } from "./link.enrichment";

const get = async (categoryId?: string): Promise<Link[]> => {
  const query = categoryId
    ? 'SELECT * FROM link WHERE category_id=$1 ORDER BY created_at DESC'
    : 'SELECT * FROM link ORDER BY created_at DESC';
  const params = categoryId ? [categoryId] : [];

  const result = await pool.query(query, params);
  return result.rows
}

const getById = async (id: string): Promise<Link | undefined> => {
  const result = await pool.query('SELECT * from link where id=$1', [id])
  return result.rows[0]
}

const create = async (url: string): Promise<Link> => {
  const result = await pool.query('INSERT INTO link (url) VALUES ($1) RETURNING *;', [url])
  return result.rows[0]
}

const update = async (linkId: string, body: Record<string, unknown>): Promise<Link | undefined> => {
  const { query, values } = patchLinkQuery(body);
  const result = await pool.query(`UPDATE link SET ${query} WHERE id=$${values.length + 1} RETURNING *;`, [...values, linkId])
  return result.rows[0]
}

const remove = async (id: string): Promise<Link | undefined> => {
  const result = await pool.query('DELETE FROM link where id=$1 RETURNING *;', [id])
  return result.rows[0]
}

const updateEnrichmentData = async (id: string, data: EnrichedMetadata): Promise<void> => {
  await pool.query('UPDATE link SET title=$1, type=$2, summary=$3, preview_image=$4, enrichment_status=$5 WHERE id=$6', [data.title, data.type, data.description, data.image?.[0]?.url, 'done', id])
}

const setFailed = async (id: string): Promise<void> => {
  await pool.query('UPDATE link SET enrichment_status=$1, enrichment_attempts=enrichment_attempts + 1 WHERE id=$2', ['failed', id])
}

export const linkRepository = {
  get,
  getById,
  create,
  update,
  remove,
  updateEnrichmentData,
  setFailed
}
