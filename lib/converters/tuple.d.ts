import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodTuple, ZodTypeAny } from "zod";
type AreAllSame<T extends [ZodTypeAny, ...ZodTypeAny[]]> = T extends [
    infer First,
    ...infer Rest
] ? Rest[number] extends First ? First extends Rest[number] ? true : false : false : true;
export type ZodTupleOneField<T extends [ZodTypeAny, ...ZodTypeAny[]] | [], Rest extends ZodTypeAny | null = null> = Rest extends null ? T extends [ZodTypeAny] ? {
    type: "array";
    required: true;
    items: ZodToOneField<T[number]>;
} : T extends [ZodTypeAny, ...ZodTypeAny[]] ? AreAllSame<T> extends false ? {
    type: "array";
    required: true;
} : {
    type: "array";
    required: true;
    items: ZodToOneField<T[number]>;
} : {
    type: "array";
    required: true;
} : Rest extends ZodTypeAny ? T extends [ZodTypeAny] ? AreAllSame<[Rest, ...T]> extends false ? {
    type: "array";
    required: true;
} : {
    type: "array";
    required: true;
    items: ZodToOneField<Rest>;
} : T extends [ZodTypeAny, ...ZodTypeAny[]] ? AreAllSame<[Rest, ...T]> extends false ? {
    type: "array";
    required: true;
} : {
    type: "array";
    required: true;
    items: ZodToOneField<T[number]>;
} : {
    type: "array";
    required: true;
} : {
    type: "array";
    required: true;
};
export declare const convertTupleSchema: <T extends [ZodTypeAny, ...ZodTypeAny[]] | [], Rest extends ZodTypeAny | null = null>(zodSchema: ZodTuple<T, Rest>, ref: Ref, opts: Opts) => ZodToOneField<ZodTuple<T, Rest>>;
export {};
//# sourceMappingURL=tuple.d.ts.map