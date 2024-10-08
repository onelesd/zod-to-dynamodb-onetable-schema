import { Table, type OneField, type OneModel } from "dynamodb-onetable";
import {
  z,
  ZodFirstPartyTypeKind,
  ZodObject,
  ZodRawShape,
  ZodSchema,
} from "zod";
import { Opts, Ref, ZodToOneField } from "./converter-types";
import { convertStringSchema } from "./converters/string";
import { convertOptionalSchema } from "./converters/optional";
import { convertNumberSchema } from "./converters/number";
import { convertNullableSchema } from "./converters/nullable";
import {
  convertObjectSchema,
  ZodObjectOneFieldSchema,
} from "./converters/object";
import { convertBooleanSchema } from "./converters/boolean";

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
    case ZodFirstPartyTypeKind.ZodString:
      return convertStringSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodNumber:
      return convertNumberSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodBigInt:
    case ZodFirstPartyTypeKind.ZodBoolean:
      return convertBooleanSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodDate:
    case ZodFirstPartyTypeKind.ZodSymbol:
    case ZodFirstPartyTypeKind.ZodUndefined:
    case ZodFirstPartyTypeKind.ZodNull:
    case ZodFirstPartyTypeKind.ZodAny:
    case ZodFirstPartyTypeKind.ZodUnknown:
    case ZodFirstPartyTypeKind.ZodNever:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodArray:
    case ZodFirstPartyTypeKind.ZodObject:
      return convertObjectSchema as ConverterFunction;
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
    case ZodFirstPartyTypeKind.ZodIntersection:
    case ZodFirstPartyTypeKind.ZodTuple:
    case ZodFirstPartyTypeKind.ZodRecord:
    case ZodFirstPartyTypeKind.ZodMap:
    case ZodFirstPartyTypeKind.ZodSet:
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodLazy:
    case ZodFirstPartyTypeKind.ZodLiteral:
    case ZodFirstPartyTypeKind.ZodEnum:
    case ZodFirstPartyTypeKind.ZodEffects:
    case ZodFirstPartyTypeKind.ZodNativeEnum:
    case ZodFirstPartyTypeKind.ZodOptional:
      return convertOptionalSchema;
    case ZodFirstPartyTypeKind.ZodNullable:
      return convertNullableSchema;
    case ZodFirstPartyTypeKind.ZodDefault:
    case ZodFirstPartyTypeKind.ZodCatch:
    case ZodFirstPartyTypeKind.ZodPromise:
    case ZodFirstPartyTypeKind.ZodBranded:
    case ZodFirstPartyTypeKind.ZodPipeline:
    case ZodFirstPartyTypeKind.ZodReadonly:
    default:
      return (_: ZodSchema, __: Ref, ___: undefined) => {
        throw new Error("Data type is not supported by `dynamodb-onetable`");
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
      if (zodSchema === undefined || zodSchema._def === undefined) return acc;
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

const accountMod = createModelSchema(
  z.object({
    hi: z.string(),
    other: z.boolean(),
    obj: z.object({ nested: z.object({ string: z.boolean() }) }).optional(),
  }),
  {},
);

const table = new Table({
  name: "test",
  schema: {
    version: "onetable:0",
    indexes: { primary: { hash: "pk", sort: "sk" } },
    models: { Account: accountMod, Other: { hi: { type: "string" } } },
  },
  partial: false,
});

const accountModel = table.getModel("Account");
const account = accountModel.create({
  hi: "hello",
  other: true,
  obj: { nested: { string: true } },
});
account.then((res) => res.obj.nested.string);
