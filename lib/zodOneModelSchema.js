"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zodOneModelSchema = void 0;
const zodOneFieldSchema_1 = require("./zodOneFieldSchema");
const zodOneModelSchema = (zodSchema, opts) => {
    return Object.entries(zodSchema._def.shape()).reduce((acc, [propName, zodSchema]) => {
        return Object.assign(Object.assign({}, acc), { [propName]: (0, zodOneFieldSchema_1.zodOneFieldSchema)(zodSchema, { currentPath: [propName] }, opts) });
    }, {});
};
exports.zodOneModelSchema = zodOneModelSchema;
