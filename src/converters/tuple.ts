import { zodOneFieldSchema } from "../";
import { Opts, Ref, ZodToOneField } from "../converter-type";
import { ZodTuple, ZodTypeAny } from "zod";

type AreAllSame<T extends [ZodTypeAny, ...ZodTypeAny[]]> = T extends [
  infer First,
  ...infer Rest,
]
  ? Rest[number] extends First // Check if all rest elements extend First
  ? First extends Rest[number] // Ensure both directions to handle empty tuples correctly
  ? true
  : false
  : false
  : true; // Base case for single element

export type ZodTupleOneField<
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [],
  Rest extends ZodTypeAny | null = null,
> = Rest extends null
  ? T extends [ZodTypeAny]
  ? { type: "array"; required: true; items: ZodToOneField<T[number]> }
  : T extends [ZodTypeAny, ...ZodTypeAny[]]
  ? AreAllSame<T> extends false
  ? { type: "array"; required: true }
  : { type: "array"; required: true; items: ZodToOneField<T[number]> }
  : { type: "array"; required: true } // base case
  : Rest extends ZodTypeAny
  ? T extends [ZodTypeAny]
  ? AreAllSame<[Rest, ...T]> extends false
  ? { type: "array"; required: true }
  : { type: "array"; required: true; items: ZodToOneField<Rest> }
  : T extends [ZodTypeAny, ...ZodTypeAny[]]
  ? AreAllSame<[Rest, ...T]> extends false
  ? { type: "array"; required: true }
  : { type: "array"; required: true; items: ZodToOneField<T[number]> }
  : { type: "array"; required: true } // base case
  : { type: "array"; required: true }; // base case

const zodSchemasAreSame = (
  schema1: ZodTypeAny,
  schema2: ZodTypeAny,
): boolean => {
  // Check if they are the same Zod type
  if (schema1._def.typeName !== schema2._def.typeName) {
    return false;
  }

  // Special case for ZodObject, where we want to compare shapes
  if (
    schema1._def.typeName === "ZodObject" &&
    schema2._def.typeName === "ZodObject"
  ) {
    return (
      JSON.stringify(schema1._def.shape()) ===
      JSON.stringify(schema2._def.shape())
    );
  }

  // For other types, compare the definitions directly
  return JSON.stringify(schema1._def) === JSON.stringify(schema2._def);
};

export const convertTupleSchema = <
  T extends [ZodTypeAny, ...ZodTypeAny[]] | [],
  Rest extends ZodTypeAny | null = null,
>(
  zodSchema: ZodTuple<T, Rest>,
  ref: Ref,
  opts: Opts,
): ZodToOneField<ZodTuple<T, Rest>> => {
  opts.logger?.debug(
    `A tuple is specified at \`${ref.currentPath.join(".")}\`. OneTable does not support tuples natively, will cast to an array instead.`,
  );
  const { items, rest } = zodSchema._def;
  const allItems = rest == null ? items : [rest as ZodTypeAny, ...items];
  if (allItems.length === 0) {
    opts.logger?.debug(
      `A tuple with no internal schema is specified at \`${ref.currentPath.join(".")}\`. Cannot infer an \`items\` value with a tuple without an internal schema, will type as \`any[]\`.`,
    );
    return { type: "array", required: true } as ZodToOneField<
      ZodTuple<T, Rest>
    >;
  }
  if (allItems.length === 1) {
    const innnerType = allItems[0];
    const items = zodOneFieldSchema(
      innnerType,
      { currentPath: [...ref.currentPath, "0"] },
      opts,
    );
    return { type: "array", required: true, items } as ZodToOneField<
      ZodTuple<T, Rest>
    >;
  }
  const { allIdentical } = allItems.reduce(
    ({ lastType, allIdentical }, curr) => ({
      lastType: curr,
      allIdentical: allIdentical && zodSchemasAreSame(lastType, curr),
    }),
    { lastType: allItems[0], allIdentical: true },
  );
  if (allIdentical) {
    const innnerType = allItems[0];
    const items = zodOneFieldSchema(
      innnerType,
      { currentPath: [...ref.currentPath, "0"] },
      opts,
    );
    return { type: "array", required: true, items } as ZodToOneField<
      ZodTuple<T, Rest>
    >;
  } else {
    opts.logger?.debug(
      `A tuple with various internal schemas is specified at \`${ref.currentPath.join(".")}\`. OneTable does not support multiple data-types in arrays - will use \`any[]\` instead.`,
    );
    return { type: "array", required: true } as ZodToOneField<
      ZodTuple<T, Rest>
    >;
  }
};
