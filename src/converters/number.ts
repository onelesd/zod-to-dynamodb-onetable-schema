import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodNumber } from "zod";

export type ZodNumberOneField = { type: "number"; required: true };

export const convertNumberSchema = (
  zodSchema: ZodNumber,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodNumber> => {
  if (zodSchema._def.checks.length !== 0) {
    opts.logger?.debug(
      `This schema defines number checks at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`,
    );
  }
  return { type: "number", required: true };
};
