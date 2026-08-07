import { serve } from "@hono/node-server";
import { app } from "./index.ts";

serve(app);

console.log("Serving app!");
