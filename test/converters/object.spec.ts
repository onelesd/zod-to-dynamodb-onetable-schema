import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertObjectSchema } from "../../src/converters/object";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

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
      hello: z.string(),
      world: z.number(),
    });

    // Act
    const onefield = convertObjectSchema(zodObjectSchema, mockRefs, mockOpts);

    // TODO: Add items for other datatypes
    // Assert
    expect(onefield).toEqual({
      type: "object",
      required: true,
      schema: {
        hello: { type: "string", required: true },
        world: { type: "number", required: true },
      },
    });
  });

  it("should return `required: false` for all keys when `.partial()` is used", () => {
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
        hello: { type: "string", required: undefined },
        world: { type: "number", required: undefined },
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
        world: { type: "number", required: undefined },
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
});
