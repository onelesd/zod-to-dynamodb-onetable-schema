import { Table, type OneField, type OneModel } from "dynamodb-onetable";
import {
  z,
  ZodFirstPartyTypeKind,
  ZodNullable,
  ZodObject,
  ZodRawShape,
  ZodSchema,
  ZodTypeAny,
} from "zod";
import { Opts, Ref, ZodToOneFieldConverter } from "./converter-types";
import { assertType } from "./assertions";
import { convertStringSchema } from "./converters/string";
import { convertOptionalSchema } from "./converters/optional";
import { convertNumberSchema } from "./converters/number";
import {
  convertObjectSchema,
  ZodObjectOneFieldSchema,
} from "./converters/object";

const convertNullableSchema: ZodToOneFieldConverter = (
  zodSchema,
  ref,
  opts,
) => {
  assertType<ZodNullable<ZodTypeAny>>(
    zodSchema,
    ZodFirstPartyTypeKind.ZodNullable,
  );
  const innerField = convertZodSchemaToField(
    zodSchema._def.innerType,
    ref,
    opts,
  );
  return { ...innerField, required: false };
};

// TODO: Remove partial
const converterMap = {
  [ZodFirstPartyTypeKind.ZodString]: convertStringSchema,
  [ZodFirstPartyTypeKind.ZodNumber]: convertNumberSchema,
  [ZodFirstPartyTypeKind.ZodObject]: convertObjectSchema,
  // [ZodFirstPartyTypeKind.ZodBigInt]: parseBigintDef,
  // [ZodFirstPartyTypeKind.ZodBoolean]: parseBooleanDef,
  // [ZodFirstPartyTypeKind.ZodDate]: parseDateDef,
  // [ZodFirstPartyTypeKind.ZodUndefined]: parseUndefinedDef,
  // [ZodFirstPartyTypeKind.ZodNull]: parseNullDef,
  // [ZodFirstPartyTypeKind.ZodArray]: parseArrayDef,
  // [ZodFirstPartyTypeKind.ZodUnion]: parseUnionDef,
  // [ZodFirstPartyTypeKind.ZodDiscriminatedUnion]: parseUnionDef,
  // [ZodFirstPartyTypeKind.ZodIntersection]: parseIntersectionDef,
  // [ZodFirstPartyTypeKind.ZodTuple]: parseTupleDef,
  // [ZodFirstPartyTypeKind.ZodRecord]: parseRecordDef,
  // [ZodFirstPartyTypeKind.ZodLiteral]: parseLiteralDef,
  // [ZodFirstPartyTypeKind.ZodEnum]: parseEnumDef,
  // [ZodFirstPartyTypeKind.ZodNativeEnum]: parseNativeEnumDef,
  [ZodFirstPartyTypeKind.ZodNullable]: convertNullableSchema,
  [ZodFirstPartyTypeKind.ZodOptional]: convertOptionalSchema,
  // [ZodFirstPartyTypeKind.ZodMap]: parseMapDef,
  // [ZodFirstPartyTypeKind.ZodSet]: parseSetDef,
  // [ZodFirstPartyTypeKind.ZodLazy]: parseDef,
  // [ZodFirstPartyTypeKind.ZodPromise]: parsePromiseDef,
  // [ZodFirstPartyTypeKind.ZodNaN]: parseNeverDef,
  // [ZodFirstPartyTypeKind.ZodNever]: parseNeverDef,
  // [ZodFirstPartyTypeKind.ZodEffects]: parseEffectsDef,
  // [ZodFirstPartyTypeKind.ZodAny]: parseAnyDef,
  // [ZodFirstPartyTypeKind.ZodUnknown]: parseUnknownDef,
  // [ZodFirstPartyTypeKind.ZodDefault]: parseDefaultDef,
  // [ZodFirstPartyTypeKind.ZodBranded]: parseBrandedDef,
  // [ZodFirstPartyTypeKind.ZodReadonly]: parseReadonlyDef,
  // [ZodFirstPartyTypeKind.ZodCatch]: parseCatchDef,
  // [ZodFirstPartyTypeKind.ZodPipeline]: parsePipelineDef,
  // [ZodFirstPartyTypeKind.ZodFunction]: undefined,
  // [ZodFirstPartyTypeKind.ZodVoid]: undefined,
  // [ZodFirstPartyTypeKind.ZodSymbol]: undefined;
};

export const convertZodSchemaToField = (
  zodSchema: ZodSchema,
  ref: Ref,
  opts: Opts,
): OneField => {
  const zodFirstPartyTypeKind = (
    zodSchema._def as Record<string, ZodFirstPartyTypeKind>
  )?.typeName;
  // TODO: Parse that a ZodFirstPartyTypeKind is returned
  const converterFunction = converterMap[zodFirstPartyTypeKind];
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
    other: z.number(),
    obj: z.object({ nested: z.object({ string: z.string() }) }),
  }),
  {},
);

const table = new Table({
  name: "test",
  schema: {
    version: "onetable:0",
    indexes: { primary: { hash: "pk", sort: "sk" } },
    models: { Account: accountMod },
  },
  partial: false,
});

const accountModel = table.getModel("Account");
const account = accountModel.create({ hi: "hello", other: 9 });
account.then((res) => res.obj.nested.string);
