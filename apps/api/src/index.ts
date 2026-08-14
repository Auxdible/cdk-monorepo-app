import { Hono } from "hono";
import { ApiGatewayRequestContextV2, handle } from "hono/aws-lambda";
import { cors } from "hono/cors";
import { task } from "./routes/task";

export interface Bindings {
  requestContexdt: ApiGatewayRequestContextV2;
}

export const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors({ origin: process.env.ALLOWED_ORIGIN }));

app.get("/api", (c) => {
  return c.text("Hello World");
});

app.route("/api/task", task);

export const handler = handle(app);
