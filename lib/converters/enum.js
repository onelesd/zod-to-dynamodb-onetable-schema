"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertEnumSchema = void 0;
const convertEnumSchema = (zodSchema, __, ___) => {
    const enumValues = zodSchema._def.values;
    return { type: "string", enum: enumValues, required: true };
};
exports.convertEnumSchema = convertEnumSchema;
