"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertLiteralSchema = void 0;
const getOneFieldTypeFromLiteralValue = (t, ref) => {
    if (typeof t === "string")
        return "string";
    if (typeof t === "number")
        return "number";
    if (typeof t === "boolean")
        return "boolean";
    throw new Error(`You have defined a literal type at \`${ref.currentPath.join(".")}\` that is not a string, boolean, or number. OneTable does not support this data type.`);
};
const convertLiteralSchema = (zodSchema, ref, ___) => {
    const literalValue = zodSchema.value;
    if (typeof literalValue === "string") {
        return {
            type: getOneFieldTypeFromLiteralValue(literalValue, ref),
            value: literalValue,
            required: true,
        };
    }
    return {
        type: getOneFieldTypeFromLiteralValue(literalValue, ref),
        required: true,
    };
};
exports.convertLiteralSchema = convertLiteralSchema;
