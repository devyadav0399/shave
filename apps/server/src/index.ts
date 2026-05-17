import { Hono } from "hono";
import { cors } from "hono/cors";
import pool from "./db/client";
import { HTTPException } from "hono/http-exception";
import { AppError } from './utils/AppError'
import { isValidUUID } from "./utils/validation";
import { enrichLink } from "./services/enrichment";
import { patchLinkQuery } from "./utils/linkQueryBuilder";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FE_URL || "http://localhost:5173",
  }),
);

// Health Check endpoints
app.get("/health", (c) =>
  c.json({
    ok: true,
    message: "Health check passed!",
  }),
);

app.get('/health/db', async (c) => {
  await pool.query('SELECT 1');
  return c.json({
    ok: true,
    message: "DB health check passed!"
  });
});

// Category endpoints
app.get('/categories', async (c) => {
  const queryResult = await pool.query('SELECT * FROM category')
  return c.json({
    ok: true,
    data: queryResult.rows
  })
})

app.post('/categories', async (c) => {
  const body = await c.req.json()
  if (!body?.name?.trim()) throw new AppError(400, 'Some fields are missing.')
  const result = await pool.query('INSERT INTO category (name) VALUES ($1) RETURNING *;', [body.name])
  return c.json(
    {
      ok: true,
      data: result.rows[0]
    },
    201
  )
})

app.delete('/categories/:categoryId', async (c) => {
  const { categoryId } = c.req.param()
  if (!isValidUUID(categoryId)) throw new AppError(400, 'Invalid ID')
  const result = await pool.query('DELETE FROM category WHERE id=$1 RETURNING *;', [categoryId])
  if (result.rows.length > 0) {
    return c.json({
      ok: true,
      data: result.rows[0]
    })
  } else throw new AppError(404, 'Not found')
})

// Link endpoints
app.get('/links', async (c) => {
  const { category } = c.req.query()
  const sql = category ? 'SELECT * FROM link WHERE category_id=$1' : 'SELECT * FROM link';
  const params = category ? [category] : [];
  const result = await pool.query(sql, params);
  // TODO: check for invalid category provided and throw
  return c.json({
    ok: true,
    data: result?.rows
  })
})

app.get('/links/:linkId', async (c) => {
  const { linkId } = c.req.param()
  if(!isValidUUID(linkId)) throw new AppError(400, 'Invalid ID')
  const result = await pool.query('SELECT * from link where id=$1', [linkId])
  if (result.rows.length > 0) {
    return c.json({
      ok: true,
      data: result.rows[0]
    })
  } else throw new AppError(404, 'Not found')
})

app.post('/links', async (c) => {
  const body = await c.req.json()
  if (!body?.url?.trim()) throw new AppError(400, 'Some fields are missing.')
  const result = await pool.query('INSERT INTO link (url) VALUES ($1) RETURNING *;', [body.url])
  enrichLink(result.rows[0].id)
    .catch(e => console.log(e))
  return c.json(
    {
      ok: true,
      data: result.rows[0]
    },
    201
  )
})

app.patch('/links/:linkId', async (c) => {
  const { linkId } = c.req.param()
  if (!isValidUUID(linkId)) throw new AppError(400, 'Invalid ID')
  const body = await c.req.json()
  if (!body?.title?.trim() && !body?.summary?.trim() && !('isConsumed' in body) && !body?.categoryId) throw new AppError(400, 'No fields provided')
  const { query, values } = patchLinkQuery(body);
  const updateResult = await pool.query(`UPDATE link SET ${query} WHERE id=$${values.length + 1} RETURNING *;`, [...values, linkId])
  if (updateResult.rows.length === 0) throw new AppError(404, 'Link not found')
  return c.json({
    ok: true,
    data: updateResult.rows[0]
  })
})

app.delete('/links/:linkId', async (c) => {
  const { linkId } = c.req.param()
  if (!isValidUUID(linkId)) throw new AppError(400, 'Invalid ID')
  const result = await pool.query('DELETE FROM link where id=$1 RETURNING *;', [linkId])
  if (result.rows.length > 0) {
    return c.json({
      ok: true,
      data: result.rows[0]
    })
  } else throw new AppError(404, 'Not found')
})

// Error handling
app.notFound((c) => {
  return c.json(
    {
      ok: false,
      error: 'Route not found',
    },
    404
  )
})

app.onError((err, c) => {
  console.error('Unhandled error:', err)

  if (err instanceof AppError) {
    return c.json(
      {
        ok: false,
        error: err.message,
      },
      err.statusCode
    )
  }

  if (err instanceof HTTPException) {
    return c.json(
      {
        ok: false,
        error: err.message,
      },
      err.status
    )
  }

  return c.json(
    {
      ok: false,
      error: 'Something went wrong',
    },
    500
  )
})


export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
