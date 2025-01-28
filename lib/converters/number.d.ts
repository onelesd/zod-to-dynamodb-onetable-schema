import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodNumber } from "zod";
export type ZodNumberOneField = {
    type: "number";
    required: true;
};
export declare const convertNumberSchema: (zodSchema: ZodNumber, ref: Ref, opts: Opts) => ZodToOneField<ZodNumber>;
//# sourceMappingURL=number.d.ts.map