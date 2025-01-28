"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodOneFieldSchema = void 0;
const zod_1 = require("zod");
const boolean_1 = require("./converters/boolean");
const date_1 = require("./converters/date");
const array_1 = require("./converters/array");
const enum_1 = require("./converters/enum");
const set_1 = require("./converters/set");
const native_enum_1 = require("./converters/native-enum");
const default_1 = require("./converters/default");
const literal_1 = require("./converters/literal");
const record_1 = require("./converters/record");
const tuple_1 = require("./converters/tuple");
const string_1 = require("./converters/string");
const optional_1 = require("./converters/optional");
const number_1 = require("./converters/number");
const nullable_1 = require("./converters/nullable");
const object_1 = require("./converters/object");
const getConverterFunction = (zodSchema) => {
    var _a;
    const zodType = (_a = zodSchema._def) === null || _a === void 0 ? void 0 : _a.typeName;
    switch (zodType) {
        case zod_1.ZodFirstPartyTypeKind.ZodOptional:
            return optional_1.convertOptionalSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodNullable:
            return nullable_1.convertNullableSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodString:
            return string_1.convertStringSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodNumber:
            return number_1.convertNumberSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodBoolean:
            return boolean_1.convertBooleanSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodObject:
            return object_1.convertObjectSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodDate:
            return date_1.convertDateSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodArray:
            return array_1.convertArraySchema;
        case zod_1.ZodFirstPartyTypeKind.ZodEnum:
            return enum_1.convertEnumSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodNativeEnum:
            return native_enum_1.convertNativeEnumSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodSet:
            return set_1.convertSetSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodDefault:
            return default_1.convertDefaultSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodLiteral:
            return literal_1.convertLiteralSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodRecord:
            return record_1.convertRecordSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodTuple:
            return tuple_1.convertTupleSchema;
        case zod_1.ZodFirstPartyTypeKind.ZodNull: // WARN: These types are unrepresentable in `dynamodb-onetable`
        case zod_1.ZodFirstPartyTypeKind.ZodIntersection:
        case zod_1.ZodFirstPartyTypeKind.ZodMap:
        case zod_1.ZodFirstPartyTypeKind.ZodNaN:
        case zod_1.ZodFirstPartyTypeKind.ZodBigInt:
        case zod_1.ZodFirstPartyTypeKind.ZodSymbol:
        case zod_1.ZodFirstPartyTypeKind.ZodUndefined:
        case zod_1.ZodFirstPartyTypeKind.ZodAny:
        case zod_1.ZodFirstPartyTypeKind.ZodNever:
        case zod_1.ZodFirstPartyTypeKind.ZodVoid:
        case zod_1.ZodFirstPartyTypeKind.ZodUnion:
        case zod_1.ZodFirstPartyTypeKind.ZodDiscriminatedUnion:
        case zod_1.ZodFirstPartyTypeKind.ZodFunction:
        case zod_1.ZodFirstPartyTypeKind.ZodUnknown:
        case zod_1.ZodFirstPartyTypeKind.ZodLazy:
        case zod_1.ZodFirstPartyTypeKind.ZodPromise:
        case zod_1.ZodFirstPartyTypeKind.ZodBranded:
        case zod_1.ZodFirstPartyTypeKind.ZodReadonly:
        default:
            return (schema, ref, ___) => {
                throw new Error(`${zodType} type is not supported by \`dynamodb-onetable\``, {
                    cause: { schema, ref },
                });
            };
    }
};
const zodOneFieldSchema = (zodSchema, ref, opts) => {
    const converterFunction = getConverterFunction(zodSchema);
    return converterFunction(zodSchema, ref !== null && ref !== void 0 ? ref : { currentPath: [] }, opts !== null && opts !== void 0 ? opts : {});
};
exports.zodOneFieldSchema = zodOneFieldSchema;
