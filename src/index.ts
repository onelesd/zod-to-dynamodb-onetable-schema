import { Table, type OneField, type OneModel } from "dynamodb-onetable";
import {
  z,
  ZodFirstPartyTypeKind,
  ZodObject,
  ZodRawShape,
  ZodSchema,
} from "zod";
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
      return convertNullableSchema;
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
    case ZodFirstPartyTypeKind.ZodLiteral:
    case ZodFirstPartyTypeKind.ZodDefault:
    case ZodFirstPartyTypeKind.ZodNativeEnum:
    case ZodFirstPartyTypeKind.ZodNull:
    case ZodFirstPartyTypeKind.ZodRecord:
    case ZodFirstPartyTypeKind.ZodMap:
    case ZodFirstPartyTypeKind.ZodSet:
    case ZodFirstPartyTypeKind.ZodTuple:
    case ZodFirstPartyTypeKind.ZodNaN:
    case ZodFirstPartyTypeKind.ZodBigInt:
    case ZodFirstPartyTypeKind.ZodSymbol:
    case ZodFirstPartyTypeKind.ZodUndefined:
    case ZodFirstPartyTypeKind.ZodAny:
    case ZodFirstPartyTypeKind.ZodNever:
    case ZodFirstPartyTypeKind.ZodVoid:
    case ZodFirstPartyTypeKind.ZodUnion:
    case ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
    case ZodFirstPartyTypeKind.ZodIntersection:
    case ZodFirstPartyTypeKind.ZodFunction:
    case ZodFirstPartyTypeKind.ZodUnknown:
    case ZodFirstPartyTypeKind.ZodLazy:
    case ZodFirstPartyTypeKind.ZodEffects:
    case ZodFirstPartyTypeKind.ZodCatch:
    case ZodFirstPartyTypeKind.ZodPromise:
    case ZodFirstPartyTypeKind.ZodBranded:
    case ZodFirstPartyTypeKind.ZodPipeline:
    case ZodFirstPartyTypeKind.ZodReadonly:
    default:
      return (schema: ZodSchema, ref: Ref, ___: Opts) => {
        throw new Error("Data type is not supported by `dynamodb-onetable`", {
          cause: { schema, ref },
        });
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

// const accountModelSchema = z.object({
//   hi: z.string(),
//   other: z.boolean(),
//   obj: z.object({
//     enum: z.enum(["val1", "hippo"]),
//   }),
// });
//
// const accountMod = createModelSchema(accountModelSchema, {});
// console.log(accountMod);
//
// const table = new Table({
//   name: "test",
//   schema: {
//     version: "onetable:0",
//     indexes: { primary: { hash: "pk", sort: "sk" } },
//     models: {
//       Account: accountMod,
//       Other: {
//         family: {
//           type: String,
//           enum: ["metrics", "events", "logs", "recommendations", "relay"],
//           required: true,
//         },
//       },
//     },
//   },
//   partial: false,
// });
//
// type Account = z.infer<typeof accountModelSchema>;
// const input: Account = {
//   hi: "hello",
//   other: true,
// };
//
// const accountModel = table.getModel("Account");
// const account = accountModel.upsert({ obj: { enum: "val1" } });
// account.then((res) => {
//   const t = res.array[0];
// });
//
// const otherModel = table.getModel("Other");
// const other = otherModel.upsert({ family: "" });
