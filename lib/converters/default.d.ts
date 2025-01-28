import { Opts, Ref, ZodToOneField } from "../converter-type";
import { z, ZodDefault, ZodTypeAny } from "zod";
export type ZodDefaultOneField<T extends ZodTypeAny> = ZodToOneField<T> & {
    default: z.util.noUndefined<T["_input"]>;
};
export declare const convertDefaultSchema: <T extends ZodTypeAny>(zodSchema: ZodDefault<T>, ref: Ref, opts: Opts) => ZodToOneField<ZodDefault<T>>;
//# sourceMappingURL=default.d.ts.map