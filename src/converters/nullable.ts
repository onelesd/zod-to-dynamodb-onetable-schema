import { convertZodSchemaToField } from "src";
import { Opts, Ref, ZodToOneField } from "src/converter-types";
import { ZodNullable, ZodTypeAny } from "zod";

export type ZodNullableOneField<Schema extends ZodTypeAny> = {
  required: false;
} & ZodToOneField<Schema>;

export const convertNullableSchema = <T extends ZodTypeAny>(
  zodSchema: ZodNullable<T>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodNullable<T>> => {
  const innerField = convertZodSchemaToField(
    zodSchema._def.innerType,
    ref,
    opts,
  );
  return { ...innerField, required: false } as ZodToOneField<ZodNullable<T>>;
};
