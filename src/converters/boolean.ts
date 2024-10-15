import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodBoolean } from "zod";

export type ZodBooleanOneField = { type: "boolean"; required: true };

export const convertBooleanSchema = (
  _: ZodBoolean,
  __: Ref,
  ___: Opts,
): ZodToOneField<ZodBoolean> => {
  return { type: "boolean", required: true };
};
