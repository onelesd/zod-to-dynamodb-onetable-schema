"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNativeEnumSchema = void 0;
const convertNativeEnumSchema = (zodSchema, ref, ___) => {
    const enumValues = zodSchema._def.values;
    const actualKeys = Object.keys(enumValues).filter((key) => {
        return typeof enumValues[enumValues[key]] !== "number";
    });
    const actualValues = actualKeys.map((key) => enumValues[key]);
    const parsedTypes = Array.from(new Set(actualValues.map((values) => typeof values)));
    if (parsedTypes.length === 1 && parsedTypes[0] === "string") {
        return { type: "string", enum: actualValues, required: true };
    }
    throw new Error(`Native enum is defined at \`${ref.currentPath.join(".")}\` that defines values of a type other than string, however OneTable only supports string values for enums`);
};
exports.convertNativeEnumSchema = convertNativeEnumSchema;
