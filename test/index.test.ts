import { it } from "vitest";
import { zodOneModelSchema } from "../src/index";
import { z } from "zod";
import { Table } from "dynamodb-onetable";

it("should pass", () => {
  // const makeZodSchema = <T>(models: T) => ({
  //   format: "onetable:1.1.0",
  //   version: "0.0.1",
  //   indexes: { primary: { hash: "pk", sort: "sk" } },
  //   models,
  //   params: { isoDates: false, timestamps: true, null: true },
  // });
  //
  // const exampleModelSchema = z.object({
  //   record: z.record(z.string(), z.string()),
  //   tuple: z.tuple([])
  // });
  //
  // const schema = makeZodSchema({
  //   Example: zodOneModelSchema(exampleModelSchema),
  // });
  //
  // const table = new Table({ schema });
  //
  // const model = table.getModel("Example");
  //
  // const exampleRecord = model.create({ record: {}, tuple:  });
});
