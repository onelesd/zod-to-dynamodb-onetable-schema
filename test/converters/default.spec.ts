import { describe, expect, it } from "vitest";
import { z, ZodTypeAny } from "zod";
import { convertDefaultSchema } from "../../src/converters/default";
import { zodOneFieldSchema } from "../../src";
import { Logger } from "winston";
import { mock } from "vitest-mock-extended";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: ["hello"] };

describe("convertDefaultSchema", () => {
  const defaultableSchemas = [
    ["number", z.number(), 9],
    ["string", z.string(), "test"],
    ["boolean", z.boolean(), true],
    ["date", z.date(), new Date("2020-01-01")],
    ["enum", z.enum(["one"]), "one"],
    ["object", z.object({ hi: z.string() }), { hi: "test" }],
    ["array", z.array(z.string()), ["hello", "world"]],
    ["set", z.set(z.string()), new Set(["hello"])],
  ] as const;
  it.each(defaultableSchemas)(
    "should return %s field with a default value",
    (_, schema: ZodTypeAny, defaultValue) => {
      // Assemble
      const zodDefaultSchema = schema.default(defaultValue);

      // Act
      const onefield = convertDefaultSchema(
        zodDefaultSchema,
        mockRefs,
        mockOpts,
      );

      // Assert
      expect(onefield).toEqual({
        default: defaultValue,
        ...zodOneFieldSchema(schema, mockRefs, mockOpts),
      });
    },
  );
});
