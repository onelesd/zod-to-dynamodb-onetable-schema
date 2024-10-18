import { Opts, Ref, ZodToOneField } from "../converter-type";
import { KeySchema, ZodRecord, ZodTypeAny } from "zod";

export type ZodRecordOneField = {
  type: "object";
  required: true;
};

export const convertRecordSchema = <
  Key extends KeySchema,
  Value extends ZodTypeAny,
>(
  _: ZodRecord<Key, Value>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodRecord<Key, Value>> => {
  opts.logger?.debug(
    `A record is specified at \`${ref.currentPath.join(".")}\`. Records cannot only be represented as a generic object in OneTable, so it will be typed as \`Record<any, any>\` instead, clobbering typing on all internal keys and values.`,
  );
  return { type: "object", required: true } as ZodToOneField<
    ZodRecord<Key, Value>
  >;
};
