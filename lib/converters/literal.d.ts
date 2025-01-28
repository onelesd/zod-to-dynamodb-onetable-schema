import { Opts, Ref, ZodToOneField } from "../converter-type";
import { Primitive, ZodBoolean, ZodLiteral, ZodNumber, ZodString } from "zod";
/**
 * type Primitive = string | number | symbol | bigint | boolean | null | undefined;
 */
type LiteralValueToZodType<T extends Primitive> = T extends string ? ZodString : T extends number ? ZodNumber : T extends boolean ? ZodBoolean : never;
export type ZodLiteralOneField<T extends Primitive> = T extends string ? {
    type: ZodToOneField<LiteralValueToZodType<T>>["type"];
    value: T;
    required: true;
} : {
    type: ZodToOneField<LiteralValueToZodType<T>>["type"];
    required: true;
};
export declare const convertLiteralSchema: <T extends Primitive>(zodSchema: ZodLiteral<T>, ref: Ref, ___: Opts) => ZodToOneField<ZodLiteral<T>>;
export {};
//# sourceMappingURL=literal.d.ts.map