import type { OneField, OneModel } from "dynamodb-onetable";
import {
  ZodFirstPartyTypeKind,
  ZodObject,
  ZodObjectDef,
  ZodRawShape,
  ZodStringCheck,
  ZodStringDef,
  ZodTypeAny,
} from "zod";

type Ref = { currentPath: string[] };

const joinPath = (paths: Array<string>) => paths.join(".");

type ZodToOneFieldConverter = (zodSchema: ZodTypeAny, ref: Ref) => OneField;

const assertDef = <Def>(
  zodDef: unknown,
  expectedType: ZodFirstPartyTypeKind,
): zodDef is Def => {
  if (typeof zodDef !== "object") throw new Error("zodDef must be an object");
  if ((zodDef as Record<string, unknown>)?.typeName === expectedType)
    return true;
  throw new Error("Parsing failed because expected ZodDef mismatched");
};

export const zodPatterns: Partial<Record<ZodStringCheck["kind"], RegExp>> = {
  cuid: /^[cC][^\s-]{8,}$/,
  cuid2: /^[0-9a-z]+$/,
  ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
  email:
    /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
  emoji: RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u"),
  uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
  base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
  nanoid: /^[a-zA-Z0-9_-]{21}$/,
  ip: /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/,
} as const;

const getStringValidators = (
  def: ZodStringDef,
  ref: Ref,
): Array<{ kind: string; regex: RegExp }> => {
  if (!def.checks) return [];
  const validators = def.checks
    .map(({ kind }) => {
      const regex = zodPatterns[kind];
      if (regex === undefined) {
        console.warn(
          `Your schema defines a string ${kind} check at \`${joinPath(ref.currentPath)}\` which is unsupported by this library`,
        );
      }
      return { kind, regex };
    })
    .filter((check) => check.regex !== undefined) as Array<{
    kind: string;
    regex: RegExp;
  }>;
  if (validators.length === 0) return [];
  return validators;
};

const convertStringSchema: ZodToOneFieldConverter = (zodSchema, ref) => {
  assertDef<ZodStringDef>(zodSchema._def, ZodFirstPartyTypeKind.ZodString);
  const validators = getStringValidators(zodSchema._def, ref);
  const validator = validators[0];
  if (validators?.length > 1) {
    console.warn(
      `This schema defines multiple checks at \`${joinPath(ref.currentPath)}\`, but only one can be used, selecting first check for ${validator.kind}`,
    );
  }
  return {
    type: "string",
    required: true,
    validate: validator?.regex ? validator.regex.toString() : undefined,
  };
};

const convertOptionalSchema: ZodToOneFieldConverter = (zodSchema, ref) => {
  const innerField = convertZodSchemaToField(zodSchema._def.innerType, ref);
  return { ...innerField, required: false };
};

const convertNullableSchema: ZodToOneFieldConverter = (zodSchema, ref) => {
  const innerField = convertZodSchemaToField(zodSchema._def.innerType, ref);
  return { ...innerField, required: false };
};

const convertObjectSchema: ZodToOneFieldConverter = (zodSchema, ref) => {
  assertDef<ZodObjectDef>(zodSchema._def, ZodFirstPartyTypeKind.ZodObject);
  const schema = Object.entries(zodSchema._def.shape()).reduce(
    (acc, [propName, zodSchema]) => {
      return {
        ...acc,
        [propName]: convertZodSchemaToField(zodSchema as ZodTypeAny, {
          ...ref,
          currentPath: [...ref.currentPath, propName],
        }),
      };
    },
    {},
  );
  return { type: "object", schema };
};

const converterMap: Record<ZodFirstPartyTypeKind, ZodToOneFieldConverter> = {
  [ZodFirstPartyTypeKind.ZodString]: convertStringSchema,
  // [ZodFirstPartyTypeKind.ZodNumber]: parseNumberDef,
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
const convertZodSchemaToField = (zodSchema: ZodTypeAny, ref: Ref): OneField => {
  return converterMap[zodSchema._def.typeName](zodSchema, ref);
};

export const createModelSchema = <T extends ZodRawShape>(
  zodSchema: ZodObject<T>,
): OneModel => {
  return Object.entries(zodSchema._def.shape()).reduce(
    (acc, [propName, zodSchema]) => {
      if (zodSchema === undefined || zodSchema._def === undefined) return acc;
      console.log(zodSchema._def.typeName);
      return {
        ...acc,
        [propName]: convertZodSchemaToField(zodSchema, {
          currentPath: [propName],
        }),
      };
    },
    {},
  );
};
