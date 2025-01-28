import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodDate } from "zod";
export type ZodDateOneField = {
    type: "date";
    required: true;
};
export declare const convertDateSchema: (zodSchema: ZodDate, ref: Ref, opts: Opts) => ZodToOneField<ZodDate>;
//# sourceMappingURL=date.d.ts.map