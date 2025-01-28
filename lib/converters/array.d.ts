import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ArrayCardinality, ZodAny, ZodArray, ZodTypeAny, ZodUnknown } from "zod";
export type ZodArrayOneField<T extends ZodTypeAny> = T extends ZodUnknown ? {
    type: ArrayConstructor;
    required: true;
} : T extends ZodAny ? {
    type: ArrayConstructor;
    required: true;
} : {
    type: ArrayConstructor;
    required: true;
    items: ZodToOneField<T>;
};
export declare const convertArraySchema: <Schema extends ZodTypeAny, Cardinality extends ArrayCardinality>(zodSchema: ZodArray<Schema, Cardinality>, ref: Ref, opts: Opts) => ZodToOneField<ZodArray<Schema, Cardinality>>;
//# sourceMappingURL=array.d.ts.map