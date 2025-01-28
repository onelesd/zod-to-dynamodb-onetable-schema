import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodNullable, ZodTypeAny } from "zod";
export type ZodNullableOneField<Schema extends ZodTypeAny> = Omit<ZodToOneField<Schema>, "required">;
export declare const convertNullableSchema: <T extends ZodTypeAny>(zodSchema: ZodNullable<T>, ref: Ref, opts: Opts) => ZodToOneField<ZodNullable<T>>;
//# sourceMappingURL=nullable.d.ts.map