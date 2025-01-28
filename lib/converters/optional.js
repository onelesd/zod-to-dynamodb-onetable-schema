"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertOptionalSchema = void 0;
const __1 = require("../");
const convertOptionalSchema = (zodSchema, ref, opts) => {
    const innerField = (0, __1.zodOneFieldSchema)(zodSchema._def.innerType, ref, opts);
    return Object.assign(Object.assign({}, innerField), { required: undefined });
};
exports.convertOptionalSchema = convertOptionalSchema;
