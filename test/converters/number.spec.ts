import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertNumberSchema } from "../../src/converters/number";
import { Logger } from "winston";
import { mock } from "vitest-mock-extended";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
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

  it("should warn via logger if checks are added that cannot be validated", () => {
    // Assemble
    const zodNumberSchema = z.number().max(10);

    // Act
    const onefield = convertNumberSchema(zodNumberSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "number",
      required: true,
    });
    expect(mockLogger.debug.mock.lastCall).toEqual([
      "This schema defines number checks at `hello`, but OneTable doesn't support this kind of validation",
    ]);
  });
});
