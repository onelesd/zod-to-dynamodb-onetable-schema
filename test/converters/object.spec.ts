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
    enum ValidEnum {
      Test = "Test",
    }
    const zodObjectSchema = z.object({
      array: z.array(z.string()),
      boolean: z.boolean(),
      date: z.date(),
      default: z.string().default("test"),
      enum: z.enum(["foo", "bar"]),
      literal: z.literal("literal"),
      nativeEnum: z.nativeEnum(ValidEnum),
      nullable: z.boolean().nullable(),
      number: z.number(),
      optional: z.boolean().optional(),
      record: z.record(z.string(), z.unknown()),
      set: z.set(z.number()),
      string: z.string(),
      tuple: z.tuple([z.string()]),
    });

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        array: {
          items: { required: true, type: "string", validate: undefined },
          required: true,
          type: Array,
        },
        boolean: { type: "boolean", required: true },
        date: { type: "date", required: true },
        default: { type: "string", required: true, default: "test" },
        enum: { enum: ["foo", "bar"], required: true, type: "string" },
        literal: { type: "string", value: "literal", required: true },
        nativeEnum: { type: "string", enum: ["Test"], required: true },
        nullable: { type: "boolean" },
        number: { type: "number", required: true },
        optional: { type: "boolean" },
        record: { type: "object", required: true },
        set: { type: Set, required: true },
        string: { type: "string", required: true },
        tuple: {
          type: "array",
          required: true,
          items: { type: "string", required: true },
        },
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
