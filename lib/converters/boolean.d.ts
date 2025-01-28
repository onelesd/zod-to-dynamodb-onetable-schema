import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodBoolean } from "zod";
export type ZodBooleanOneField = {
    type: "boolean";
    required: true;
};
export declare const convertBooleanSchema: (_: ZodBoolean, __: Ref, ___: Opts) => ZodToOneField<ZodBoolean>;
//# sourceMappingURL=boolean.d.ts.map