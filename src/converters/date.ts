import { Opts, Ref, ZodToOneField } from "src/converter-type";
import { ZodDate } from "zod";

export type ZodDateOneField = { type: "date"; required: true };

export const convertDateSchema = (
  zodSchema: ZodDate,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodDate> => {
  if (zodSchema._def.checks.length !== 0) {
    opts.logger?.debug(
      `This schema defines date checks at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`,
    );
  }
  return { type: "date", required: true };
};
