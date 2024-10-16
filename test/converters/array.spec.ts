import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodOneFieldSchema } from "../../src";
import { convertArraySchema } from "../../src/converters/array";
import { Logger } from "winston";
import { mock } from "vitest-mock-extended";

const mockLogger = mock<Logger>();
const mockOpts = { logger: mockLogger };
const mockRefs = { currentPath: ["hello"] };

describe("convertArraySchema", () => {
  it("should always return required array field", () => {
    // Assemble
    const zodArraySchema = z.array(z.any());

    // Act
    const onefield = convertArraySchema(zodArraySchema, mockRefs, mockOpts);

    // Assert
    expect(onefield).toEqual({ type: Array, required: true });
  });

  it("should return a schema without an `items` attribute if using `.unknown()` or `.any()`", () => {
    // Assemble
    const zodArraySchemaAny = z.array(z.any());
    const zodArraySchemaUnknown = z.array(z.unknown());

    // Act
    const onefieldAny = convertArraySchema(
      zodArraySchemaAny,
      mockRefs,
      mockOpts,
    );
    const onefieldUnknown = convertArraySchema(
      zodArraySchemaUnknown,
      mockRefs,
      mockOpts,
    );

    // Assert
    expect(onefieldAny).toEqual({ type: Array, required: true });
    expect(onefieldUnknown).toEqual({ type: Array, required: true });
  });

  // TODO: Fill out remaining
  const schemaTypes = [
    ["number", z.number()],
    ["string", z.string()],
    ["object", z.object({})],
    ["boolean", z.boolean()],
    ["date", z.date()],
  ] as const;
  it.each(schemaTypes)(
    "should return array field with items when %s schema is supplied",
    (_, schema) => {
      // Assemble
      const zodArraySchema = z.array(schema);

      // Act
      const onefield = convertArraySchema(zodArraySchema, mockRefs, mockOpts);

      // Assert
      expect(onefield).toEqual({
        type: Array,
        required: true,
        items: zodOneFieldSchema(schema, mockRefs, mockOpts),
      });
    },
  );

  const unenforcableValidations = [
    [
      "min",
      z.array(z.string()).min(1),
      "This schema defines an array minimum length check at `hello`, but OneTable doesn't support this kind of validation",
    ],
    [
      "max",
      z.array(z.string()).max(10),
      "This schema defines an array maximum length check at `hello`, but OneTable doesn't support this kind of validation",
    ],
    [
      "exact",
      z.array(z.string()).length(5),
      "This schema defines an array exact length check at `hello`, but OneTable doesn't support this kind of validation",
    ],
    [
      "nonempty",
      z.array(z.string()).nonempty(),
      "This schema defines an array minimum length check at `hello`, but OneTable doesn't support this kind of validation",
    ],
  ] as const;
  it.each(unenforcableValidations)(
    "should warn via logger if %s validation exists on the schema that can't be satified in a onefield",
    (_, zodArraySchema, warnMessage) => {
      // Act
      convertArraySchema(zodArraySchema, mockRefs, mockOpts);

      // Assert
      expect(mockLogger.debug.mock.lastCall).toEqual([warnMessage]);
    },
  );
});
