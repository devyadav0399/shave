import pool from "../../db/client"
import type { Category } from "../../types/category"

const get = async (): Promise<Category[]> => {
  const result = await pool.query('SELECT * FROM category')
  return result.rows
}

const create = async (name: string): Promise<Category> => {
  const result = await pool.query('INSERT INTO category (name) VALUES ($1) RETURNING *;', [name])
  return result.rows[0]
}

const remove = async (id: string): Promise<Category | undefined> => {
  const result = await pool.query('DELETE FROM category WHERE id=$1 RETURNING *;', [id])
  return result.rows[0]
}

export const categoryRepository = { get, create, remove }
