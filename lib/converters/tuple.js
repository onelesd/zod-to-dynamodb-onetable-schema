"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertTupleSchema = void 0;
const __1 = require("../");
const zodSchemasAreSame = (schema1, schema2) => {
    // Check if they are the same Zod type
    if (schema1._def.typeName !== schema2._def.typeName) {
        return false;
    }
    // Special case for ZodObject, where we want to compare shapes
    if (schema1._def.typeName === "ZodObject" &&
        schema2._def.typeName === "ZodObject") {
        return (JSON.stringify(schema1._def.shape()) ===
            JSON.stringify(schema2._def.shape()));
    }
    // For other types, compare the definitions directly
    return JSON.stringify(schema1._def) === JSON.stringify(schema2._def);
};
const convertTupleSchema = (zodSchema, ref, opts) => {
    var _a, _b, _c;
    (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`A tuple is specified at \`${ref.currentPath.join(".")}\`. OneTable does not support tuples natively, will cast to an array instead.`);
    const { items, rest } = zodSchema._def;
    const allItems = rest == null ? items : [rest, ...items];
    if (allItems.length === 0) {
        (_b = opts.logger) === null || _b === void 0 ? void 0 : _b.debug(`A tuple with no internal schema is specified at \`${ref.currentPath.join(".")}\`. Cannot infer an \`items\` value with a tuple without an internal schema, will type as \`any[]\`.`);
        return { type: "array", required: true };
    }
    if (allItems.length === 1) {
        const innnerType = allItems[0];
        const items = (0, __1.zodOneFieldSchema)(innnerType, { currentPath: [...ref.currentPath, "0"] }, opts);
        return { type: "array", required: true, items };
    }
    const { allIdentical } = allItems.reduce(({ lastType, allIdentical }, curr) => ({
        lastType: curr,
        allIdentical: allIdentical && zodSchemasAreSame(lastType, curr),
    }), { lastType: allItems[0], allIdentical: true });
    if (allIdentical) {
        const innnerType = allItems[0];
        const items = (0, __1.zodOneFieldSchema)(innnerType, { currentPath: [...ref.currentPath, "0"] }, opts);
        return { type: "array", required: true, items };
    }
    else {
        (_c = opts.logger) === null || _c === void 0 ? void 0 : _c.debug(`A tuple with various internal schemas is specified at \`${ref.currentPath.join(".")}\`. OneTable does not support multiple data-types in arrays - will use \`any[]\` instead.`);
        return { type: "array", required: true };
    }
};
exports.convertTupleSchema = convertTupleSchema;
