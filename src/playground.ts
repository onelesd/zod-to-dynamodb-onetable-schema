import { Table } from "dynamodb-onetable";
import { createModelSchema } from "src";
import { z } from "zod";

const makeZodSchema = <T>(models: T) => ({
  format: "onetable:1.1.0",
  version: "0.0.1",
  indexes: { primary: { hash: "pk", sort: "sk" } },
  models,
  params: { isoDates: false, timestamps: true, null: true },
});

enum ValidEnum {
  TEST = "TEST",
}

const exampleModelSchema = z.object({
  pk: z.literal("example#{string}"),
  sk: z.string(),
  string: z.string(),
  number: z.literal(9),
  date: z.date(),
  object: z.object({ string: z.string(), number: z.number() }),
  array: z.array(z.object({ hello: z.string() })),
  enum: z.enum(["hello", "world"]),
  nativeEnum: z.nativeEnum(ValidEnum),
});

const table = new Table({
  name: "TestTable",
  partial: true,
  schema: makeZodSchema({
    Example: createModelSchema(exampleModelSchema, {}),
  }),
});

const model = table.getModel("Example");
