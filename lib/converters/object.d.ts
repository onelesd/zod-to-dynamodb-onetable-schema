import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodObject, ZodRawShape } from "zod";
export type ZodObjectOneFieldSchema<T extends ZodRawShape> = {
    [K in keyof ReturnType<ZodObject<T>["_def"]["shape"]>]: ZodToOneField<ReturnType<ZodObject<T>["_def"]["shape"]>[K]>;
};
export type ZodObjectOneField<T extends ZodRawShape> = {
    type: "object";
    required: true;
    schema: keyof T extends never ? undefined : ZodObjectOneFieldSchema<T>;
};
export declare const convertObjectSchema: <Schema extends ZodRawShape>(zodSchema: ZodObject<Schema>, ref: Ref, opts: Opts) => ZodToOneField<ZodObject<Schema>>;
//# sourceMappingURL=object.d.ts.map