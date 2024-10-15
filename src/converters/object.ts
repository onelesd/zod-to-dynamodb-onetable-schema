import { zodOneFieldSchema } from "../";
import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodObject, ZodRawShape, ZodTypeAny } from "zod";

export type ZodObjectOneFieldSchema<T extends ZodRawShape> = {
  [K in keyof ReturnType<ZodObject<T>["_def"]["shape"]>]: ZodToOneField<
    ReturnType<ZodObject<T>["_def"]["shape"]>[K]
  >;
};

export type ZodObjectOneField<T extends ZodRawShape> = {
  type: "object";
  required: true;
  schema: keyof T extends never ? undefined : ZodObjectOneFieldSchema<T>;
};

export const convertObjectSchema = <Schema extends ZodRawShape>(
  zodSchema: ZodObject<Schema>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodObject<Schema>> => {
  const shape = zodSchema._def.shape();
  if (Object.keys(shape).length === 0) {
    return {
      type: "object",
      required: true,
      schema: undefined,
    } as ZodToOneField<ZodObject<Schema>>;
  }
  const schema = Object.entries(shape).reduce((acc, [propName, zodSchema]) => {
    return {
      ...acc,
      [propName]: zodOneFieldSchema(
        zodSchema as ZodTypeAny,
        { ...ref, currentPath: [...ref.currentPath, propName] },
        opts,
      ),
    };
  }, {} as ZodObjectOneFieldSchema<Schema>);
  return { type: "object", schema, required: true } as ZodToOneField<
    ZodObject<Schema>
  >;
};
