import { ZodString, ZodStringCheck } from "zod";
import { Opts, Ref, ZodToOneField } from "../converter-type";
export type ZodStringOneField = {
    type: "string";
    required: true;
    validate?: string;
};
export declare const zodStringCheckPatterns: Partial<Record<ZodStringCheck["kind"], RegExp>>;
export declare const convertStringSchema: (zodSchema: ZodString, ref: Ref, opts: Opts) => ZodToOneField<ZodString>;
//# sourceMappingURL=string.d.ts.map