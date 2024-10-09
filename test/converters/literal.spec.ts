import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertLiteralSchema } from "../../src/converters/literal";
import { Logger } from "winston";
import { mock } from "vitest-mock-extended";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: ["hello"] };

describe("convertLiteralSchema", () => {
  it.each([
    ["string", "test"],
    ["number", 9],
    ["boolean", true],
  ])(
    "should return required literal field for supported %s data type",
    (type, value) => {
      // Assemble
      const zodLiteralSchema = z.literal(value);

      // Act
      const onefield = convertLiteralSchema(
        zodLiteralSchema,
        mockRefs,
        mockOpts,
      );

      // Assert
      expect(onefield).toMatchObject({ type: type, required: true });
    },
  );

  it("should return field with value when using a string", () => {
    // Assemble
    const zodLiteralSchema = z.literal("hello");

    // Act
    const onefield = convertLiteralSchema(zodLiteralSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "string",
      value: "hello",
      required: true,
    });
  });

  it.each([
    ["undefined", undefined],
    ["null", null],
    ["symbol", Symbol("symbol")],
    ["bigint", BigInt(100000000000)],
  ])("should throw an error for unsupported %s data type", (_, value) => {
    // Assemble
    const zodLiteralSchema = z.literal(value);

    // Act
    const managedEffect = () =>
      convertLiteralSchema(zodLiteralSchema, mockRefs, mockOpts);

    // Assert
    expect(managedEffect).toThrowError(
      "You have defined a literal type at `hello` that is not a string, boolean, or number. OneTable does not support this data type.",
    );
  });
});
