import { Opts, Ref, ZodToOneField } from "src/converter-types";
import { ZodBoolean, z } from "zod";

export type ZodBooleanOneField = { type: "boolean"; required: true };

export const convertBooleanSchema = (
  _: ZodBoolean,
  __: Ref,
  ___: Opts,
): ZodToOneField<ZodBoolean> => {
  return { type: "boolean", required: true };
};
