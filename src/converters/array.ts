import { convertZodSchemaToField } from "src";
import { Opts, Ref, ZodToOneField } from "src/converter-type";
import {
  ArrayCardinality,
  ZodAny,
  ZodArray,
  ZodFirstPartyTypeKind,
  ZodTypeAny,
  ZodUnknown,
} from "zod";

// For some reason, inference is more consistent when using a constructor value on arrays
export type ZodArrayOneField<T extends ZodTypeAny> = T extends ZodUnknown
  ? { type: ArrayConstructor; required: true }
  : T extends ZodAny
  ? { type: ArrayConstructor; required: true }
  : {
    type: ArrayConstructor;
    required: true;
    items: ZodToOneField<T>;
  };

export const convertArraySchema = <
  Schema extends ZodTypeAny,
  Cardinality extends ArrayCardinality,
>(
  zodSchema: ZodArray<Schema, Cardinality>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodArray<Schema, Cardinality>> => {
  if (zodSchema._def.minLength) {
    opts.logger?.debug(
      `This schema defines an array minimum length check at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`,
    );
  }
  if (zodSchema._def.maxLength) {
    opts.logger?.debug(
      `This schema defines an array maximum length check at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`,
    );
  }
  if (zodSchema._def.exactLength) {
    opts.logger?.debug(
      `This schema defines an array exact length check at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`,
    );
  }
  const innnerType = zodSchema._def.type;
  const innerTypeName = innnerType._def.typeName;
  if (
    innerTypeName === ZodFirstPartyTypeKind.ZodAny ||
    innerTypeName === ZodFirstPartyTypeKind.ZodUnknown
  ) {
    return { type: Array, required: true } as ZodToOneField<
      ZodArray<Schema, Cardinality>
    >;
  }
  const items = convertZodSchemaToField(
    innnerType,
    { currentPath: [...ref.currentPath, "0"] },
    opts,
  );
  return { type: Array, items, required: true } as ZodToOneField<
    ZodArray<Schema, Cardinality>
  >;
};
