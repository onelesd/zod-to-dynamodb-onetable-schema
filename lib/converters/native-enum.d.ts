import { Opts, Ref, ZodToOneField } from "../converter-type";
import { EnumLike, ZodNativeEnum } from "zod";
export type ZodNativeEnumOneField<Enum extends EnumLike> = {
    type: "string";
    enum: Enum[keyof Enum][];
    required: true;
};
export declare const convertNativeEnumSchema: <Enum extends EnumLike>(zodSchema: ZodNativeEnum<Enum>, ref: Ref, ___: Opts) => ZodToOneField<ZodNativeEnum<Enum>>;
//# sourceMappingURL=native-enum.d.ts.map