import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodEnum } from "zod";
export type ZodEnumOneField<Enum extends [string, ...string[]]> = {
    type: "string";
    enum: Enum;
    required: true;
};
export declare const convertEnumSchema: <Enum extends [string, ...string[]]>(zodSchema: ZodEnum<Enum>, __: Ref, ___: Opts) => ZodToOneField<ZodEnum<Enum>>;
//# sourceMappingURL=enum.d.ts.map