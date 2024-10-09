import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertNativeEnumSchema } from "../../src/converters/native-enum";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

describe("convertNativeEnumSchema", () => {
  it("should return required enum field for string enum", () => {
    // Assemble
    enum ValidEnum {
      One = "One",
      Two = "Two",
    }
    const zodNativeEnumSchema = z.nativeEnum(ValidEnum);

    // Act
    const onefield = convertNativeEnumSchema(
      zodNativeEnumSchema,
      mockRefs,
      mockOpts,
    );

    // Assert
    expect(onefield).toEqual({
      type: "string",
      enum: ["One", "Two"],
      required: true,
    });
  });

  it("should throw an error if using native enum with number values", () => {
    // Assemble
    enum InvalidEnum {
      One,
      Two,
    }
    const zodNativeEnumSchema = z.nativeEnum(InvalidEnum);

    // Act
    const delayedEffect = () =>
      convertNativeEnumSchema(zodNativeEnumSchema, mockRefs, mockOpts);

    // Assert
    expect(delayedEffect).toThrowError(
      "Native enum is defined at `hello` that defines values of a type other than string, however OneTable only supports string values for enums",
    );
  });
});
