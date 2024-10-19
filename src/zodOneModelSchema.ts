import { ZodObject, ZodRawShape } from "zod";
import { Opts } from "./converter-type";
import { ZodObjectOneFieldSchema } from "./converters/object";
import { zodOneFieldSchema } from "./zodOneFieldSchema";

export const zodOneModelSchema = <T extends ZodRawShape>(
  zodSchema: ZodObject<T>,
  opts?: Opts,
): ZodObjectOneFieldSchema<T> => {
  return Object.entries(zodSchema._def.shape()).reduce(
    (acc, [propName, zodSchema]) => {
      return {
        ...acc,
        [propName]: zodOneFieldSchema(
          zodSchema,
          { currentPath: [propName] },
          opts,
        ),
      };
    },
    {} as ZodObjectOneFieldSchema<T>,
  );
};
