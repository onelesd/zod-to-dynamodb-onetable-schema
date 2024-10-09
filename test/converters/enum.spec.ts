import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertEnumSchema } from "../../src/converters/enum";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

describe("convertEnumSchema", () => {
  it("should return required enum field", () => {
    // Assemble
    const zodEnumSchema = z.enum(["hello", "world"]);

    // Act
    const onefield = convertEnumSchema(zodEnumSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "string",
      enum: ["hello", "world"],
      required: true,
    });
  });
});
