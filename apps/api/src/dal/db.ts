import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { randomUUIDv7 } from "crypto";
import { Entity } from "electrodb";
const client = DynamoDBDocumentClient.from(new DynamoDBClient());

const table = "tasks";

const Task = new Entity(
  {
    model: {
      entity: "task",
      version: "1",
      service: "store",
    },
    attributes: {
      taskID: {
        type: "string",
        default: () => randomUUIDv7(),
        required: false,
      },
      createdDate: {
        type: "string",
        default: () => new Date().toISOString(),
        required: false,
      },
      title: {
        type: "string",
      },
      description: {
        type: "string",
      },
    },
    indexes: {
      taskID: {
        pk: {
          field: "pk",
          composite: ["taskID"],
        },
        sk: {
          field: "sk",
          composite: ["createdDate"],
        },
      },
    },
  },
  { client, table },
);

export default Task;
