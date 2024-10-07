import { ZodFirstPartyTypeKind, ZodSchema } from "zod";

export function assertType<T extends ZodSchema>(
  zodSchema: ZodSchema,
  expectedType: ZodFirstPartyTypeKind,
): asserts zodSchema is T {
  if ((zodSchema._def as Record<string, unknown>).typeName !== expectedType) {
    throw new Error(`Schema is not of expected kind: ${expectedType}`);
  }
}
