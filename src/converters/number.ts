import { assertType } from "src/assertions";
import { ZodToOneFieldConverter } from "src/converter-types";
import { ZodFirstPartyTypeKind, ZodNumber } from "zod";

export const convertNumberSchema: ZodToOneFieldConverter = (zodSchema) => {
  assertType<ZodNumber>(zodSchema, ZodFirstPartyTypeKind.ZodNumber);
  return { type: "number", required: true };
};

export type ZodNumberOneField = { type: "number"; required: true };
