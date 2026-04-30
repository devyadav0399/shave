import { Hono } from "hono";
import { cors } from "hono/cors";

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

export default {
  port: process.env.PORT,
  fetch: app.fetch,
};
