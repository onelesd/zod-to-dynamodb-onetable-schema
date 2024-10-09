import { Opts, Ref, ZodToOneField } from "src/converter-type";
import { ZodSet } from "zod";

export type ZodSetOneField = { type: SetConstructor; required: true };

export const convertSetSchema = (
  _: ZodSet,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodSet> => {
  /**
   * Learn more at [the `dynamodb-onetable` repo](https://github.com/sensedeep/dynamodb-onetable/blob/2de9a37c1d6b8c8ad466c1bf714c6f376040de66/src/Model.d.ts#L18)
   */
  opts.logger?.debug(
    `This schema defines a set at \`${ref.currentPath.join(".")}\`, OneTable supports sets, but their contents are untyped, this is a limitation of the \`dynamodb-onetable\` library`,
  );
  return { type: Set, required: true };
};
