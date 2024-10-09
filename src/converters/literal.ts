import { Opts, Ref, ZodToOneField } from "src/converter-type";
import { Primitive, ZodBoolean, ZodLiteral, ZodNumber, ZodString } from "zod";

/**
 * type Primitive = string | number | symbol | bigint | boolean | null | undefined;
 */
type LiteralValueToZodType<T extends Primitive> = T extends string
  ? ZodString
  : T extends number
  ? ZodNumber
  : T extends boolean
  ? ZodBoolean
  : never;

const getOneFieldTypeFromLiteralValue = <T extends Primitive>(
  t: T,
  ref: Ref,
): ZodToOneField<LiteralValueToZodType<T>>["type"] => {
  if (typeof t === "string") return "string";
  if (typeof t === "number") return "number";
  if (typeof t === "boolean") return "boolean";
  throw new Error(
    `You have defined a literal type at \`${ref.currentPath.join(".")}\` that is not a string, boolean, or number. OneTable does not support this data type.`,
  );
};

export type ZodLiteralOneField<T extends Primitive> = T extends string
  ? {
    type: ZodToOneField<LiteralValueToZodType<T>>["type"];
    value: T;
    required: true;
  }
  : {
    type: ZodToOneField<LiteralValueToZodType<T>>["type"];
    required: true;
  };

export const convertLiteralSchema = <T extends Primitive>(
  zodSchema: ZodLiteral<T>,
  ref: Ref,
  ___: Opts,
): ZodToOneField<ZodLiteral<T>> => {
  const literalValue = zodSchema.value;
  if (typeof literalValue === "string") {
    return {
      type: getOneFieldTypeFromLiteralValue(literalValue, ref),
      value: literalValue,
      required: true,
    } as ZodToOneField<ZodLiteral<T>>;
  }
  return {
    type: getOneFieldTypeFromLiteralValue(literalValue, ref),
    required: true,
  } as ZodToOneField<ZodLiteral<T>>;
};
