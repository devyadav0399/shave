import { Hono } from "hono";
import { cors } from "hono/cors";
import pool from "./db/client";
import { HTTPException } from "hono/http-exception";
import { AppError } from './utils/AppError'
import { categoryRoutes } from "./modules/category/category.routes";
import { linkRoutes } from "./modules/link/link.routes";

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

app.route('/categories', categoryRoutes)

app.route ('/links', linkRoutes)

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
