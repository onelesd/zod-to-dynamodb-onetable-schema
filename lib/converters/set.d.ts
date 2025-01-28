import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodSet } from "zod";
export type ZodSetOneField = {
    type: SetConstructor;
    required: true;
};
export declare const convertSetSchema: (_: ZodSet, ref: Ref, opts: Opts) => ZodToOneField<ZodSet>;
//# sourceMappingURL=set.d.ts.map