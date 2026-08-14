import { Hono } from "hono";
import { handle } from "hono/aws-lambda";

export const app = new Hono();

app.get("/api", (c) => {
  return c.text("Hello World");
});

app.get("/api/test", (c) => {
  return c.json({ test: "This is a test of the endpoint!" });
});

export const handler = handle(app);
