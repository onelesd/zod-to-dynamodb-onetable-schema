import { OneField } from "dynamodb-onetable";
import { Logger } from "winston";
import {
  ZodArray,
  ZodBoolean,
  ZodDate,
  ZodNumber,
  ZodObject,
  ZodOptional,
  ZodSchema,
  ZodString,
  ZodTypeAny,
} from "zod";
import { ZodStringOneField } from "./converters/string";
import { ZodNumberOneField } from "./converters/number";
import { ZodObjectOneField } from "./converters/object";
import { ZodOptionalOneField } from "./converters/optional";

export type Ref = { currentPath: string[] };
export type Opts = { logger?: Logger };

export type ZodToOneFieldConverter = (
  zodSchema: ZodSchema,
  ref: Ref,
  opts: Opts,
) => OneField;

export type ZodToOneField<T extends ZodTypeAny> = T extends ZodString
  ? ZodStringOneField
  : T extends ZodNumber
    ? ZodNumberOneField
    : T extends ZodBoolean
      ? // TODO:
        { type: "boolean" }
      : T extends ZodDate
        ? // TODO:
          { type: "date" }
        : T extends ZodArray<infer Item>
          ? // TODO:
            { type: "list"; items: ZodToOneField<Item> }
          : T extends ZodObject<infer Shape>
            ? ZodObjectOneField<Shape>
            : T extends ZodOptional<infer Schema>
              ? ZodOptionalOneField<Schema>
              : never;
