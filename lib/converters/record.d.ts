import { Opts, Ref, ZodToOneField } from "../converter-type";
import { KeySchema, ZodRecord, ZodTypeAny } from "zod";
export type ZodRecordOneField = {
    type: "object";
    required: true;
};
export declare const convertRecordSchema: <Key extends KeySchema, Value extends ZodTypeAny>(_: ZodRecord<Key, Value>, ref: Ref, opts: Opts) => ZodToOneField<ZodRecord<Key, Value>>;
//# sourceMappingURL=record.d.ts.map