import { describe, expect, it, afterEach, vi } from "vitest";
import { z } from "zod";
import { convertTupleSchema } from "../../src/converters/tuple";
import { mock } from "vitest-mock-extended";
import { Logger } from "winston";
import { zodOneFieldSchema } from "../../src";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: [] };

describe("convertTupleSchema", () => {
  const testSchemas = [
    z.string(),
    z.number(),
    z.object({ hello: z.string() }),
    z.array(z.string()),
    z.set(z.string()),
  ];

  afterEach(() => {
    vi.resetAllMocks();
  });

  it("should return a tuple schema without `items` field when the array is empty", () => {
    // Assemble
    const zodTupleSchema = z.tuple([]);

    // Act
    const onefield = convertTupleSchema(zodTupleSchema, mockRefs, mockOpts);

    // Asset
    expect(onefield).toEqual({ type: "array", required: true });
    expect(mockLogger.debug.mock.calls).toContainEqual([
      "A tuple is specified at ``. OneTable does not support tuples natively, will cast to an array instead.",
    ]);
    expect(mockLogger.debug.mock.calls).toContainEqual([
      "A tuple with no internal schema is specified at ``. Cannot infer an `items` value with a tuple without an internal schema, will type as `any[]`.",
    ]);
  });

  it.each(testSchemas)(
    "should return tuple schema with `items` field containing $_def.typeName when tuple contains a single item",
    (zodSchema) => {
      // Assemble
      const zodTupleSchema = z.tuple([zodSchema]);
      // Act
      const onefield = convertTupleSchema(zodTupleSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({
        type: "array",
        required: true,
        items: zodOneFieldSchema(zodSchema),
      });
      expect(mockLogger.debug.mock.calls).toContainEqual([
        "A tuple is specified at ``. OneTable does not support tuples natively, will cast to an array instead.",
      ]);
    },
  );

  it.each(testSchemas)(
    "should return tuple schema with `items` field containing $_def.typeName when tuple contains multiple identical items",
    (zodSchema) => {
      // Assemble
      const zodTupleSchema = z.tuple([zodSchema, zodSchema]);
      // Act
      const onefield = convertTupleSchema(zodTupleSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({
        type: "array",
        required: true,
        items: zodOneFieldSchema(zodSchema, { currentPath: ["0"] }),
      });
    },
  );

  const testMismatchedSchemas = testSchemas.map((val, i, arr) => ({
    schema1: val,
    schema2: i === arr.length - 1 ? arr[0] : arr[i + 1],
  }));

  it.each(testMismatchedSchemas)(
    "should return tuple schema without `items` field containing when tuple different $schema1._def.typeName and $schema2._def.typeName schemas",
    ({ schema1, schema2 }) => {
      // Assemble
      const zodTupleSchema = z.tuple([schema1, schema2]);

      // Act
      const onefield = convertTupleSchema(zodTupleSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({ type: "array", required: true });
      expect(mockLogger.debug.mock.calls).toContainEqual([
        "A tuple with various internal schemas is specified at ``. OneTable does not support multiple data-types in arrays - will use `any[]` instead.",
      ]);
    },
  );

  it.each(testSchemas)(
    "should return tuple schema with `items` field if rest and items match $_def.typeName",
    (zodSchema) => {
      // Assemble
      const zodTupleSchema = z.tuple([zodSchema]).rest(zodSchema);
      // Act
      const onefield = convertTupleSchema(zodTupleSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({
        type: "array",
        required: true,
        items: zodOneFieldSchema(zodSchema),
      });
      expect(mockLogger.debug.mock.calls).toContainEqual([
        "A tuple is specified at ``. OneTable does not support tuples natively, will cast to an array instead.",
      ]);
    },
  );

  it.each(testMismatchedSchemas)(
    "should return tuple schema without `items` field if rest ($schema2._def.typeName) and items ($schema1._def.typeName) do not match ",
    ({ schema1, schema2 }) => {
      // Assemble
      const zodTupleSchema = z.tuple([schema1]).rest(schema2);
      // Act
      const onefield = convertTupleSchema(zodTupleSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({ type: "array", required: true });
      expect(mockLogger.debug.mock.calls).toContainEqual([
        "A tuple with various internal schemas is specified at ``. OneTable does not support multiple data-types in arrays - will use `any[]` instead.",
      ]);
    },
  );
});
