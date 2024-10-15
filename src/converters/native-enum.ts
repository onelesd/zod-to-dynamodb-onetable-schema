import { Opts, Ref, ZodToOneField } from "../converter-type";
import { EnumLike, ZodNativeEnum } from "zod";

export type ZodNativeEnumOneField<Enum extends EnumLike> = {
  type: "string";
  enum: Enum[keyof Enum][];
  required: true;
};

export const convertNativeEnumSchema = <Enum extends EnumLike>(
  zodSchema: ZodNativeEnum<Enum>,
  ref: Ref,
  ___: Opts,
): ZodToOneField<ZodNativeEnum<Enum>> => {
  const enumValues = zodSchema._def.values;
  const actualKeys = Object.keys(enumValues).filter((key: string) => {
    return typeof enumValues[enumValues[key]] !== "number";
  });
  const actualValues = actualKeys.map(
    (key: keyof EnumLike) => enumValues[key],
  ) as Enum[keyof Enum][];
  const parsedTypes = Array.from(
    new Set(actualValues.map((values: string | number) => typeof values)),
  );
  if (parsedTypes.length === 1 && parsedTypes[0] === "string") {
    return { type: "string", enum: actualValues, required: true };
  }
  throw new Error(
    `Native enum is defined at \`${ref.currentPath.join(".")}\` that defines values of a type other than string, however OneTable only supports string values for enums`,
  );
};
