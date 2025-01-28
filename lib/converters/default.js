"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDefaultSchema = void 0;
const __1 = require("../");
const convertDefaultSchema = (zodSchema, ref, opts) => {
    const innerZodSchema = zodSchema._def.innerType;
    const innerOneField = (0, __1.zodOneFieldSchema)(innerZodSchema, ref, opts);
    const defaultValue = zodSchema._def.defaultValue();
    return Object.assign(Object.assign({}, innerOneField), { default: defaultValue });
};
exports.convertDefaultSchema = convertDefaultSchema;
