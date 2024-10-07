import { it, expect } from "vitest";
import { z } from "zod";
import { createModelSchema } from "../src";

it("should work", () => {
  const zodSchema = z.object({
    hello: z.object({
      world: z.string().date().ulid().email().nullable(),
      other: z.string(),
    }),
  });

  const onetableSchema = createModelSchema(zodSchema);

  console.log(JSON.stringify(onetableSchema));
});
