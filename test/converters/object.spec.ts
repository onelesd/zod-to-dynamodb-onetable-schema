import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertObjectSchema } from "../../src/converters/object";
import { mock } from "vitest-mock-extended";
import { Logger } from "winston";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: [] };

describe("convertObjectSchema", () => {
  it("should return schemaless object if no keys supplied", () => {
    // Assemble
    const zodObjectSchema = z.object({});

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    expect(onefield).toEqual({
      type: "object",
      required: true,
    });
  });

  it("should return all keys with their own onefield schemas filled in", () => {
    // Assemble
    const zodObjectSchema = z.object({
      string: z.string(),
      number: z.number(),
      boolean: z.boolean(),
      optional: z.boolean().optional(),
      nullable: z.boolean().nullable(),
    });

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // TODO: Add items for other datatypes
    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        string: { type: "string", required: true },
        number: { type: "number", required: true },
        boolean: { type: "boolean", required: true },
        optional: { type: "boolean" },
        nullable: { type: "boolean" },
      },
    });
  });

  it("should remove required fields for all keys when `.partial()` is used", () => {
    // Assemble
    const zodObjectSchema = z
      .object({
        hello: z.string(),
        world: z.number(),
      })
      .partial();

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        hello: { type: "string" },
        world: { type: "number" },
      },
    });
  });

  it("should return selectively `required: true` when `.required()` is used", () => {
    // Assemble
    const zodObjectSchema = z
      .object({
        hello: z.string(),
        world: z.number(),
      })
      .partial()
      .required({ hello: true });

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        hello: { type: "string", required: true },
        world: { type: "number" },
      },
    });
  });

  it("should return only selected keys when `.pick()` is used", () => {
    // Assemble
    const zodObjectSchema = z
      .object({
        hello: z.string(),
        world: z.number(),
      })
      .pick({ world: true });

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        world: { type: "number", required: true },
      },
    });
  });

  it("should act recursively on objects contained in keys", () => {
    // Assemble
    const zodObjectSchema = z.object({
      hello: z.object({ world: z.object({ foo: z.number() }) }),
    });

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        hello: {
          type: "object",
          required: true,
          schema: {
            world: {
              type: "object",
              required: true,
              schema: { foo: { type: "number", required: true } },
            },
          },
        },
      },
    });
  });

  it("should udate the ref path when passing it recurively", () => {
    // Assemble
    const zodObjectSchema = z.object({
      hello: z.object({ world: z.object({ foo: z.number().max(10) }) }), // max causes debug log
    });

    // Act
    convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // Assert
    expect(mockLogger.debug.mock.lastCall).toEqual([
      "This schema defines number checks at `hello.world.foo`, but OneTable doesn't support this kind of validation",
    ]);
  });
});
