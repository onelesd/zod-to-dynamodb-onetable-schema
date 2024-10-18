import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Table } from "dynamodb-onetable";
import { zodOneModelSchema } from "../src";
import { z } from "zod";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { vi } from "vitest";
import { TableConstructorParams } from "dynamodb-onetable/dist/mjs/Table";

const dynamoExecutedCommandsTracer = vi.fn();

const ClientV3 = new DynamoDBClient({
  endpoint: `http://localhost:${process.env.DYNAMODB_PORT}`,
  region: "local",
  credentials: { accessKeyId: "test", secretAccessKey: "test" },
  logger: {
    debug: dynamoExecutedCommandsTracer,
    info: dynamoExecutedCommandsTracer,
    warn: dynamoExecutedCommandsTracer,
    error: dynamoExecutedCommandsTracer,
  },
});

const makeZodSchema = <T>(models: T) => ({
  format: "onetable:1.1.0",
  version: "0.0.1",
  indexes: { primary: { hash: "pk", sort: "sk" } },
  models,
  params: { isoDates: false, timestamps: true, null: true },
});

enum ValidEnum {
  TEST = "TEST",
  DEFAULT = "DEFAULT",
}

const exampleEntitySchema = z.object({
  array: z.array(z.number()).default([5]),
  boolean: z.boolean().default(false),
  date: z.date().default(new Date("2020-01-01")),
  enum: z.enum(["hello", "world"]).default("hello"),
  literal: z.literal("hello").default("hello"),
  nativeEnum: z.nativeEnum(ValidEnum).default(ValidEnum.DEFAULT),
  nullable: z.string().nullable().default(null),
  number: z.number().default(3),
  object: z
    .object({ foo: z.literal("bar").default("bar") })
    .default({ foo: "bar" }),
  optional: z.string().optional(),
  record: z.record(z.string(), z.number()).default({ test: 9 }),
  set: z.set(z.string()).default(new Set(["default", "set"])),
  string: z.string().default("default-string"),
  tuple: z.tuple([z.string()]).default(["tuple"]),
});

const exampleModelSchema = exampleEntitySchema.extend({
  pk: z.literal("${_type}#${string}"),
  sk: z.literal("${_type}#"),
});

const schema = makeZodSchema({
  Example: zodOneModelSchema(exampleModelSchema),
});

const tableConstructorParams: [
  string,
  TableConstructorParams<typeof schema>,
][] = [
    [
      "withIsoDates = false",
      {
        name: "withIsoDatesFalseTable",
        client: ClientV3,
        partial: true,
        schema: schema,
        isoDates: true,
      },
    ],
    [
      "withIsoDates = true",
      {
        name: "withIsoDatesTrueTable",
        client: ClientV3,
        partial: true,
        schema: schema,
        isoDates: true,
      },
    ],
  ];

describe.each(tableConstructorParams)(
  "zodOneModelSchema %s",
  (_, tableConstructorParams) => {
    const table = new Table(tableConstructorParams);

    beforeAll(async () => {
      if (!(await table.exists())) {
        await table.createTable();
        expect(await table.exists()).toBe(true);
      }
    });

    afterAll(async () => {
      if (await table.exists()) {
        await table.deleteTable("DeleteTableForever");
        expect(await table.exists()).toBe(false);
      }
    });

    it("test dynamo upsert and get", async () => {
      // Assemble
      const exampleModel = table.getModel("Example");

      // Act
      const inMemoryExampleEntity: z.infer<typeof exampleEntitySchema> = {
        string: "test",
        number: 1,
        date: new Date("2024-01-01"),
        nativeEnum: ValidEnum.TEST,
        enum: "world",
        array: [0],
        set: new Set(["hello", "world"]),
        record: { test: 9 },
        literal: "hello",
        object: { foo: "bar" },
        boolean: true,
        nullable: null,
        tuple: ["test"],
      };
      await exampleModel.create({
        ...inMemoryExampleEntity,
        nullable: undefined,
      });
      const exampleRecord = await exampleModel.get(
        { string: "test" },
        { hidden: true },
      );

      // Assert
      expect(exampleRecord).toMatchObject(inMemoryExampleEntity);
      expect(exampleEntitySchema.parse(exampleRecord)).toEqual(
        inMemoryExampleEntity,
      );
    });

    it("test that upsert is operational relying on defaults", async () => {
      // Assemble
      const exampleModel = table.getModel("Example");

      // Act
      await exampleModel.create({});
      const exampleRecord = await exampleModel.get(
        { string: "default-string" },
        { hidden: true },
      );

      // Assert
      expect(exampleRecord).toMatchObject({
        string: "default-string",
        number: 3,
        date: new Date("2020-01-01"),
        array: [5],
        enum: "hello",
        nativeEnum: ValidEnum.DEFAULT,
        set: new Set(["default", "set"]),
        nullable: null,
        record: { test: 9 },
        literal: "hello",
        object: { foo: "bar" },
        tuple: ["tuple"],
      });
      expect(() => exampleEntitySchema.parse(exampleRecord)).not.toThrowError();
    });
  },
);
