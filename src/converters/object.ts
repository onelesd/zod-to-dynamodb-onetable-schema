import { convertZodSchemaToField } from "src";
import { Opts, Ref, ZodToOneField } from "src/converter-types";
import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export type ZodObjectOneFieldSchema<T extends ZodRawShape> = {
  [K in keyof ReturnType<ZodObject<T>["_def"]["shape"]>]: ZodToOneField<
    ReturnType<ZodObject<T>["_def"]["shape"]>[K]
  >;
};

export type ZodObjectOneField<T extends ZodRawShape> = {
  type: "object";
  schema: ZodObjectOneFieldSchema<T>;
  required: true;
};

export const convertObjectSchema = <Schema extends ZodRawShape>(
  zodSchema: ZodObject<Schema>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodObject<Schema>> => {
  const schema = Object.entries(zodSchema._def.shape()).reduce(
    (acc, [propName, zodSchema]) => {
      return {
        ...acc,
        [propName]: convertZodSchemaToField(
          zodSchema as ZodTypeAny,
          { ...ref, currentPath: [...ref.currentPath, propName] },
          opts,
        ),
      };
    },
    {} as ZodObjectOneFieldSchema<Schema>,
  );
  return { type: "object", schema, required: true };
};
