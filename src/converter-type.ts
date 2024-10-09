import { Logger } from "winston";
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodEnum,
  ZodNumber,
  ZodObject,
  ZodOptional,
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
  : never;
