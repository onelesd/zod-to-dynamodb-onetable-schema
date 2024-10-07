import { convertZodSchemaToField } from "src";
import { assertType } from "src/assertions";
import { ZodToOneField, ZodToOneFieldConverter } from "src/converter-types";
import {
  AnyZodObject,
  ZodFirstPartyTypeKind,
  ZodObject,
  ZodRawShape,
  ZodTypeAny,
} from "zod";

export const convertObjectSchema: ZodToOneFieldConverter = (
  zodSchema,
  ref,
  opts,
) => {
  assertType<AnyZodObject>(zodSchema, ZodFirstPartyTypeKind.ZodObject);
  const schema = Object.entries(zodSchema._def.shape()).reduce(
    (acc, [propName, zodSchema]) => {
      return {
        ...acc,
        [propName]: convertZodSchemaToField(
          zodSchema as ZodTypeAny,
          {
            ...ref,
            currentPath: [...ref.currentPath, propName],
          },
          opts,
        ),
      };
    },
    {},
  );
  return { type: "object", schema };
};

export type ZodObjectOneFieldSchema<T extends ZodRawShape> = {
  [K in keyof ReturnType<ZodObject<T>["_def"]["shape"]>]: ZodToOneField<
    ReturnType<ZodObject<T>["_def"]["shape"]>[K]
  >;
};

export type ZodObjectOneField<T extends ZodRawShape> = {
  type: "object";
  schema: ZodObjectOneFieldSchema<T>;
};
