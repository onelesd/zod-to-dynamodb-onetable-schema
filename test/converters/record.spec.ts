import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertRecordSchema } from "../../src/converters/record";
import { mock } from "vitest-mock-extended";
import { Logger } from "winston";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: [] };

describe("convertRecordSchema", () => {
  const keyTypes = [z.string(), z.number(), z.symbol()];
  const testValueTypes = [
    z.string(),
    z.number(),
    z.object({ hello: z.string() }),
    z.record(z.string(), z.unknown()),
    z.unknown(),
    z.array(z.string()),
    z.symbol(),
    z.set(z.string()),
  ];
  const testableZodRecordMatrix = keyTypes.flatMap((keySchema) =>
    testValueTypes.map((valueSchema) => z.record(keySchema, valueSchema)),
  );

  it.each(testableZodRecordMatrix)(
    "should return schemaless object supplied for keyType $_def.keyType._def.typeName and valueType $_def.valueType._def.typeName",
    (zodRecordSchema) => {
      // Act
      const onefield = convertRecordSchema(zodRecordSchema, mockRefs, mockOpts);

      expect(onefield).toEqual({ type: "object", required: true });
    },
  );

  it("should notify the user that `z.record()` clobbers OneTable typing via debug", () => {
    // Assemble
    const zodRecordSchema = z.record(z.string(), z.unknown());

    // Act
    convertRecordSchema(
      zodRecordSchema,
      { currentPath: ["hello", "world"] },
      mockOpts,
    );

    // Assert
    expect(mockLogger.debug.mock.lastCall).toEqual([
      "A record is specified at `hello.world`. Records cannot only be represented as a generic object in OneTable, so it will be typed as `Record<any, any>` instead, clobbering typing on all internal keys and values.",
    ]);
  });
});
