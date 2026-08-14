import { Hono } from "hono";
import { handle } from "hono/aws-lambda";
import { cors } from "hono/cors";

export const app = new Hono();

app.use("*", cors({ origin: process.env.ALLOWED_ORIGIN }));

app.get("/api", (c) => {
  return c.text("Hello World");
});

app.get("/api/test", (c) => {
  return c.json({ test: "This is a test of the endpoint!" });
});

export const handler = handle(app);
