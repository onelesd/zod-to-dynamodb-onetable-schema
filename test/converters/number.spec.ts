import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertNumberSchema } from "../../src/converters/number";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

describe("convertNumberSchema", () => {
  it("should return required number field", () => {
    // Assemble
    const zodNumberSchema = z.number();

    // Act
    const onefield = convertNumberSchema(zodNumberSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: "number", required: true });
  });

  it.todo(
    "should warn via logger if checks are added that cannot be validated",
  );
});
