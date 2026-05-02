import { Hono } from "hono";
import { cors } from "hono/cors";
import pool from "./src/db/client";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: process.env.FE_URL || "http://localhost:5173",
  }),
);

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

app.get('/db-test', async (c) => {
  const queryResult = await pool.query('SELECT * FROM category')
  return c.json({
    ok: true,
    data: queryResult.rows
  })
})

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
