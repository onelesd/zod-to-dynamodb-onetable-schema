import { convertZodSchemaToField } from "src";
import { assertType } from "src/assertions";
import { ZodToOneField, ZodToOneFieldConverter } from "src/converter-types";
import { ZodFirstPartyTypeKind, ZodOptional, ZodTypeAny } from "zod";

export const convertOptionalSchema: ZodToOneFieldConverter = (
  zodSchema,
  ref,
  opts,
) => {
  assertType<ZodOptional<ZodTypeAny>>(
    zodSchema,
    ZodFirstPartyTypeKind.ZodOptional,
  );
  const innerField = convertZodSchemaToField(
    zodSchema._def.innerType,
    ref,
    opts,
  );
  return { ...innerField, required: false };
};

export type ZodOptionalOneField<Schema extends ZodTypeAny> = {
  required: false;
} & ZodToOneField<Schema>;
