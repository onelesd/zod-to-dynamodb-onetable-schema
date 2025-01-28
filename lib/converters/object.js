"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertObjectSchema = void 0;
const __1 = require("../");
const convertObjectSchema = (zodSchema, ref, opts) => {
    const shape = zodSchema._def.shape();
    if (Object.keys(shape).length === 0) {
        return {
            type: "object",
            required: true,
            schema: undefined,
        };
    }
    const schema = Object.entries(shape).reduce((acc, [propName, zodSchema]) => {
        return Object.assign(Object.assign({}, acc), { [propName]: (0, __1.zodOneFieldSchema)(zodSchema, Object.assign(Object.assign({}, ref), { currentPath: [...ref.currentPath, propName] }), opts) });
    }, {});
    return { type: "object", schema, required: true };
};
exports.convertObjectSchema = convertObjectSchema;
