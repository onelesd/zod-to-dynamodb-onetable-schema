import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertBooleanSchema } from "../../src/converters/boolean";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

describe("convertBooleanSchema", () => {
  it("should return required boolean field", () => {
    // Assemble
    const zodBooleanSchema = z.boolean();

    // Act
    const onefield = convertBooleanSchema(zodBooleanSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: "boolean", required: true });
  });
});
