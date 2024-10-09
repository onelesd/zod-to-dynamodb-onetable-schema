import { describe, expect, it } from "vitest";
import { z } from "zod";
import { convertSetSchema } from "../../src/converters/set";
import { Logger } from "winston";
import { mock } from "vitest-mock-extended";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: ["hello"] };

describe("convertSetSchema", () => {
  it("should return required set field", () => {
    // Assemble
    const zodSetSchema = z.set(z.number());

    // Act
    const onefield = convertSetSchema(zodSetSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: Set, required: true });
  });

  it("should warn via logger about typing", () => {
    // Assemble
    const zodSetSchema = z.set(z.number());

    // Act
    const onefield = convertSetSchema(zodSetSchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: Set, required: true });
    expect(mockLogger.debug.mock.lastCall).toEqual([
      "This schema defines a set at `hello`, OneTable supports sets, but their contents are untyped, this is a limitation of the `dynamodb-onetable` library",
    ]);
  });
});
