import { ZodObject, ZodRawShape } from "zod";
import { Opts } from "./converter-type";
import { ZodObjectOneFieldSchema } from "./converters/object";
export declare const zodOneModelSchema: <T extends ZodRawShape>(zodSchema: ZodObject<T>, opts?: Opts) => ZodObjectOneFieldSchema<T>;
//# sourceMappingURL=zodOneModelSchema.d.ts.map