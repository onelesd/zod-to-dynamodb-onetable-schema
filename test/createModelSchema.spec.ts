import { describe, it, expect, beforeAll } from "vitest";
import { Table } from "dynamodb-onetable";
import { createModelSchema } from "../src";
import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { vi } from "vitest";

const dynamoExecutedCommandsTracer = vi.fn();

const PORT = parseInt(process.env.PORT || "4567");

const ClientV3 = new DynamoDBClient({
  endpoint: `http://localhost:${PORT}`,
  region: "local",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  logger: {
    debug: dynamoExecutedCommandsTracer,
    info: dynamoExecutedCommandsTracer,
    warn: dynamoExecutedCommandsTracer,
    error: dynamoExecutedCommandsTracer,
  },
});

describe("createModelSchema", () => {
  const makeZodSchema = <T>(models: T) => ({
    format: "onetable:1.1.0",
    version: "0.0.1",
    indexes: { primary: { hash: "pk", sort: "sk" } },
    models,
    params: { isoDates: false, timestamps: true, null: true },
  });

  const exampleModelSchema = z.object({
    pk: z.string(),
    sk: z.string(),
    string: z.string(),
    number: z.number(),
    date: z.date(),
  });

  const table = new Table({
    name: "BasicTable",
    client: ClientV3,
    partial: true,
    schema: makeZodSchema({
      Example: createModelSchema(exampleModelSchema, {}),
    }),
  });

  beforeAll(async () => {
    if (!(await table.exists())) {
      await table.createTable();
      expect(await table.exists()).toBe(true);
    }
  });

  it("test dynamo", async () => {
    // Assemble
    const exampleModel = table.getModel("Example");

    // Act
    await exampleModel.upsert({
      pk: "1",
      sk: "2",
      string: "test",
      number: 1,
      date: new Date("2024-01-01"),
    });
    const exampleRecord = await exampleModel.get({ pk: "1", sk: "2" });

    // Assert
    expect(exampleRecord).toMatchObject({
      pk: "1",
      sk: "2",
      string: "test",
      number: 1,
      date: new Date("2024-01-01T00:00:00.000Z"),
    });
    console.log(exampleRecord);
    expect(exampleModelSchema.safeParse(exampleRecord).success).toBe(true);
  });
});
