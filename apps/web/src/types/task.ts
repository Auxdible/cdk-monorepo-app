import { z } from "zod";

export const zTaskForm = z.object({
  description: z
    .string({ error: "You need to specify a Description!" })
    .min(1, { error: "You need to specify a Description!" }),
  title: z
    .string({ error: "You need to specify a Title!" })
    .min(1, { error: "You need to specify a Title!" }),
});
export type TaskForm = z.infer<typeof zTaskForm>;
export const zTask = zTaskForm.extend({
  dateCreated: z.iso.datetime(),
  taskID: z.string(),
});
export type Task = z.infer<typeof zTask>;
