import { afterEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { convertOptionalSchema } from "../../src/converters/optional";

const mockOpts = {};
const mockRefs = { currentPath: ["hello"] };

describe("convertOptionalSchema", () => {
  afterEach(() => vi.resetAllMocks());

  it("should set required to false for the inner type and return it", () => {
    // Assemble
    const zodOptionalSchema = z.number().optional();

    // Act
    const onefield = convertOptionalSchema(
      zodOptionalSchema,
      mockRefs,
      mockOpts,
    );

    // Assert
    expect(onefield).toEqual({ type: "number", required: false });
  });
});
