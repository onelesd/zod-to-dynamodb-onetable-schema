import { ZodFirstPartyTypeKind, ZodObject, ZodRawShape, ZodSchema } from "zod";
import { Opts, Ref, ZodToOneField } from "./converter-type";
import { convertStringSchema } from "./converters/string";
import { convertOptionalSchema } from "./converters/optional";
import { convertNumberSchema } from "./converters/number";
import { convertNullableSchema } from "./converters/nullable";
import {
  convertObjectSchema,
  ZodObjectOneFieldSchema,
} from "./converters/object";
import { convertBooleanSchema } from "./converters/boolean";
import { convertDateSchema } from "./converters/date";
import { convertArraySchema } from "./converters/array";
import { convertEnumSchema } from "./converters/enum";
import { convertSetSchema } from "./converters/set";
import { convertNativeEnumSchema } from "./converters/native-enum";
import { convertDefaultSchema } from "./converters/default";
import { convertLiteralSchema } from "./converters/literal";

type ConverterFunction = <T extends ZodSchema>(
  schema: ZodSchema,
  ref: Ref,
  opts: Opts,
) => ZodToOneField<T>;

const getConverterFunction = <T extends ZodSchema>(
  zodSchema: T,
): ConverterFunction => {
  const zodType = (zodSchema._def as Record<string, ZodFirstPartyTypeKind>)
    ?.typeName;
  switch (zodType) {
    case ZodFirstPartyTypeKind.ZodOptional:
      return convertOptionalSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodNullable:
      return convertNullableSchema as unknown as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodString:
      return convertStringSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodNumber:
      return convertNumberSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodBoolean:
      return convertBooleanSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodObject:
      return convertObjectSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodDate:
      return convertDateSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodArray:
      return convertArraySchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodEnum:
      return convertEnumSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodNativeEnum:
      return convertNativeEnumSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodSet:
      return convertSetSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodDefault:
      return convertDefaultSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodLiteral:
      return convertLiteralSchema as ConverterFunction;
    // TODO: Can be coersed (future work)
    case ZodFirstPartyTypeKind.ZodRecord:
    case ZodFirstPartyTypeKind.ZodMap:
    case ZodFirstPartyTypeKind.ZodTuple:
    case ZodFirstPartyTypeKind.ZodIntersection:
    case ZodFirstPartyTypeKind.ZodNull: // WARN: These types are unrepresentable in `dynamodb-onetable`
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodBigInt:
    case ZodFirstPartyTypeKind.ZodSymbol:
    case ZodFirstPartyTypeKind.ZodUndefined:
    case ZodFirstPartyTypeKind.ZodAny:
    case ZodFirstPartyTypeKind.ZodNever:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodUnknown:
    case ZodFirstPartyTypeKind.ZodLazy:
    case ZodFirstPartyTypeKind.ZodPromise:
    case ZodFirstPartyTypeKind.ZodBranded:
    case ZodFirstPartyTypeKind.ZodReadonly:
    default:
      return (schema: ZodSchema, ref: Ref, ___: Opts) => {
        throw new Error(
          `${zodType} type is not supported by \`dynamodb-onetable\``,
          {
            cause: { schema, ref },
          },
        );
      };
  }
};

export const convertZodSchemaToField = <T extends ZodSchema>(
  zodSchema: T,
  ref: Ref,
  opts: Opts,
): ZodToOneField<T> => {
  const converterFunction = getConverterFunction(zodSchema);
  return converterFunction(zodSchema, ref, opts);
};

export const createModelSchema = <T extends ZodRawShape>(
  zodSchema: ZodObject<T>,
  opts: Opts,
): ZodObjectOneFieldSchema<T> => {
  return Object.entries(zodSchema._def.shape()).reduce(
    (acc, [propName, zodSchema]) => {
      return {
        ...acc,
        [propName]: convertZodSchemaToField(
          zodSchema,
          { currentPath: [propName] },
          opts,
        ),
      };
    },
    {} as ZodObjectOneFieldSchema<T>,
  );
};

// TODO: Replace strings with constructors
// TODO: GHA publish pipeline
