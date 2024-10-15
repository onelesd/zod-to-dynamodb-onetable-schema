import { convertZodSchemaToField } from "../";
import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodOptional, ZodTypeAny } from "zod";

export type ZodOptionalOneField<Schema extends ZodTypeAny> = Omit<
  ZodToOneField<Schema>,
  "required"
>;

export const convertOptionalSchema = <T extends ZodTypeAny>(
  zodSchema: ZodOptional<T>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodOptional<T>> => {
  const innerField = convertZodSchemaToField(
    zodSchema._def.innerType,
    ref,
    opts,
  );
  return { ...innerField, required: undefined };
};
