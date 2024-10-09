import { it, expect, describe, afterEach, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { z, ZodString, ZodStringCheck } from "zod";
import { Logger } from "winston";
import {
  convertStringSchema,
  zodStringCheckPatterns,
} from "../../src/converters/string";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: ["hello"] };

describe("convertStringSchema", () => {
  afterEach(() => vi.resetAllMocks());

  it("should transform strings", () => {
    // Assemble
    const zodStringSchema = z.string();

    // Act
    const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: "string", required: true });
  });

  it.each(Object.entries(zodStringCheckPatterns))(
    "should include `%s` validator strings",
    (kind, regex) => {
      // Assemble
      const stringSchemaBase = z.string();
      const zodStringSchema =
        typeof stringSchemaBase[kind as keyof ZodString] === "function"
          ? (stringSchemaBase[kind as keyof ZodString] as Function)?.()
          : stringSchemaBase;

      // Act
      const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({
        type: "string",
        required: true,
        validate: regex.toString(),
      });
    },
  );

  it("should include `include` validator strings", () => {
    // Assemble
    const zodStringSchema = z.string().includes("test");

    // Act
    const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "string",
      required: true,
      validate: "/test/",
    });
  });

  it("should include `startsWith` validator strings", () => {
    // Assemble
    const zodStringSchema = z.string().startsWith("test");

    // Act
    const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "string",
      required: true,
      validate: "/^test/",
    });
  });

  it("should include `endsWith` validator strings", () => {
    // Assemble
    const zodStringSchema = z.string().endsWith("test");

    // Act
    const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "string",
      required: true,
      validate: "/test$/",
    });
  });

  const unsupportedFormats: Array<ZodStringCheck["kind"]> = [
    "length",
    "min",
    "max",
    "url",
    "date",
    "datetime",
    "duration",
    "time",
    "toLowerCase",
    "toUpperCase",
    "trim",
  ];
  it.each(unsupportedFormats)(
    "should debug via logger if unsupported `%s` check is requested",
    (kind) => {
      // Assemble
      const stringSchemaBase = z.string();
      const zodStringSchema =
        typeof stringSchemaBase[kind as keyof ZodString] === "function"
          ? (stringSchemaBase[kind as keyof ZodString] as Function)?.()
          : stringSchemaBase;

      // Act
      const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({
        type: "string",
        required: true,
      });
      expect(mockLogger.debug.mock.lastCall).toEqual([
        `Your schema defines a string ${kind} check at \`hello\` which is unsupported by this library`,
      ]);
    },
  );

  it("should debug via logger if multiple competing validators used", () => {
    // Assemble
    const zodStringSchema = z.string().email().uuid();

    // Act
    const onefield = convertStringSchema(zodStringSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "string",
      required: true,
      validate:
        "/^(?!\\.)(?!.*\\.\\.)([a-zA-Z0-9_'+\\-\\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\\-]*\\.)+[a-zA-Z]{2,}$/",
    });
    expect(mockLogger.debug.mock.lastCall).toEqual([
      "This schema defines multiple checks at `hello`, but only one can be used, selecting first check: email",
    ]);
  });
});
