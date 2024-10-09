import { Logger } from "winston";
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodDefault,
  ZodEnum,
  ZodNativeEnum,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodSet,
  ZodString,
  ZodTypeAny,
} from "zod";
import { ZodStringOneField } from "./converters/string";
import { ZodNumberOneField } from "./converters/number";
import { ZodObjectOneField } from "./converters/object";
import { ZodOptionalOneField } from "./converters/optional";
import { ZodBooleanOneField } from "./converters/boolean";
import { ZodDateOneField } from "./converters/date";
import { ZodArrayOneField } from "./converters/array";
import { ZodEnumOneField } from "./converters/enum";
import { ZodSetOneField } from "./converters/set";
import { ZodNativeEnumOneField } from "./converters/native-enum";
import { ZodDefaultOneField } from "./converters/default";

export type Ref = { currentPath: string[] };
export type Opts = { logger?: Logger };

export type ZodToOneField<T extends ZodTypeAny> = T extends ZodString
  ? ZodStringOneField
  : T extends ZodNumber
  ? ZodNumberOneField
  : T extends ZodBoolean
  ? ZodBooleanOneField
  : T extends ZodDate
  ? ZodDateOneField
  : T extends ZodArray<infer Item>
  ? ZodArrayOneField<Item>
  : T extends ZodObject<infer Shape>
  ? ZodObjectOneField<Shape>
  : T extends ZodOptional<infer Schema>
  ? ZodOptionalOneField<Schema>
  : T extends ZodEnum<infer Enum>
  ? ZodEnumOneField<Enum>
  : T extends ZodNativeEnum<infer Enum>
  ? ZodNativeEnumOneField<Enum>
  : T extends ZodSet<infer Schema>
  ? ZodSetOneField
  : T extends ZodDefault<infer Schema>
  ? ZodDefaultOneField<Schema>
  : never;
