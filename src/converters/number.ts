import { Opts, Ref, ZodToOneField } from "src/converter-types";
import { ZodNumber } from "zod";

export type ZodNumberOneField = { type: "number"; required: true };

export const convertNumberSchema = (
  _: ZodNumber,
  __: Ref,
  ___: Opts,
): ZodToOneField<ZodNumber> => {
  return { type: "number", required: true };
};
