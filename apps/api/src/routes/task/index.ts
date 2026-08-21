import { Hono } from "hono";
import { Bindings } from "hono/types";
import Task from "../../dal/db";
import { type Bindings as AppBindings } from "./index";
import { EntityItem, QueryResponse } from "electrodb";

export const task = new Hono<{ Bindings: AppBindings }>();

task.get("/", async (c) => {
  let cursor = null;
  let allItems: EntityItem<typeof Task>[] = [];

  do {
    const results: QueryResponse<typeof Task> = await Task.scan.go({
      cursor,
    });
    allItems = [...allItems, ...results.data];
    cursor = results.cursor;
  } while (cursor !== null);
  return c.json({ data: allItems }, { status: 200 });
});

task.post("/", async (c) => {
  const data = await c.req.json<{
    title: string;
    description: string;
  }>();

  try {
    const createdTask = await Task.create({
      title: data.title,
      description: data.description,
    }).go();
    if (createdTask.data) {
      return c.json(createdTask, 201);
    }
  } catch (x) {
    return c.json({ error: x instanceof Error ? x.message : x + "" }, 500);
  }
  return c.json({ error: "Failed to create" }, 400);
});
task.delete("/:taskID", async (c) => {
  const data = c.req.param("taskID");

  try {
    const items = await Task.query
      .taskID({
        taskID: data,
      })
      .go();
    const deletedTask = await Task.delete(items.data).go();
    return c.json({ success: true }, 200);
  } catch (x) {
    return c.json({ error: x instanceof Error ? x.message : x + "" }, 500);
  }
  return c.json({ error: "Failed to create" }, 400);
});

export { Bindings };
