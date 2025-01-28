import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodOptional, ZodTypeAny } from "zod";
export type ZodOptionalOneField<Schema extends ZodTypeAny> = Omit<ZodToOneField<Schema>, "required">;
export declare const convertOptionalSchema: <T extends ZodTypeAny>(zodSchema: ZodOptional<T>, ref: Ref, opts: Opts) => ZodToOneField<ZodOptional<T>>;
//# sourceMappingURL=optional.d.ts.map