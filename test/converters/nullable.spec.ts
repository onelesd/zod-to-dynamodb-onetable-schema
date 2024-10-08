import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { convertNullableSchema } from "../../src/converters/nullable";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

describe("convertNullableSchema", () => {
  afterEach(() => vi.resetAllMocks());

  it("should set required to false for the inner type and return it", () => {
    // Assemble
    const zodNullableSchema = z.number().nullable();

    // Act
    const onefield = convertNullableSchema(
      zodNullableSchema,
      mockRefs,
      mockOpts,
    );

    // Assert
    expect(onefield).toEqual({ type: "number", required: false });
  });
});
