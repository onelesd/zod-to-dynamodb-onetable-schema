import { zodOneFieldSchema } from "../";
import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodNullable, ZodTypeAny } from "zod";

export type ZodNullableOneField<Schema extends ZodTypeAny> = Omit<
  ZodToOneField<Schema>,
  "required"
>;

export const convertNullableSchema = <T extends ZodTypeAny>(
  zodSchema: ZodNullable<T>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodNullable<T>> => {
  const innerField = zodOneFieldSchema(
    zodSchema._def.innerType,
    ref,
    opts,
  );
  return { ...innerField, required: undefined } as ZodToOneField<
    ZodNullable<T>
  >;
};
