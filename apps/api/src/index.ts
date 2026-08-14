import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

export const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello World");
});

export const handler = handle(app);
