import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertDateSchema } from "../../src/converters/date";
import { mock } from "vitest-mock-extended";
import { Logger } from "winston";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: ["hello"] };

describe("convertBooleanSchema", () => {
  it("should return required boolean field", () => {
    // Assemble
    const zodDateSchema = z.date();

    // Act
    const onefield = convertDateSchema(zodDateSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: "date", required: true });
  });

  it("should warn via logger if validators are used", () => {
    // Assemble
    const zodDateSchema = z.date().max(new Date());

    // Act
    const onefield = convertDateSchema(zodDateSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({
      type: "date",
      required: true,
    });
    expect(mockLogger.debug.mock.lastCall).toEqual([
      "This schema defines date checks at `hello`, but OneTable doesn't support this kind of validation",
    ]);
  });
});
