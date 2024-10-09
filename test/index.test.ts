import { it } from "vitest";
import { convertZodSchemaToField } from "../src/index.ts";
import { z } from "zod";

it("should pass", () => {
  convertZodSchemaToField(z.date(), { currentPath: [] }, {});
});
