import { zodOneFieldSchema } from "../";
import { Opts, Ref, ZodToOneField } from "../converter-type";
import { z, ZodDefault, ZodTypeAny } from "zod";

export type ZodDefaultOneField<T extends ZodTypeAny> = ZodToOneField<T> & {
  default: z.util.noUndefined<T["_input"]>;
};

export const convertDefaultSchema = <T extends ZodTypeAny>(
  zodSchema: ZodDefault<T>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodDefault<T>> => {
  const innerZodSchema = zodSchema._def.innerType;
  const innerOneField = zodOneFieldSchema(innerZodSchema, ref, opts);
  const defaultValue = zodSchema._def.defaultValue();
  return { ...innerOneField, default: defaultValue };
};
