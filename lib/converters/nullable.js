"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNullableSchema = void 0;
const __1 = require("../");
const convertNullableSchema = (zodSchema, ref, opts) => {
    const innerField = (0, __1.zodOneFieldSchema)(zodSchema._def.innerType, ref, opts);
    return Object.assign(Object.assign({}, innerField), { required: undefined });
};
exports.convertNullableSchema = convertNullableSchema;
