"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertArraySchema = void 0;
const __1 = require("../");
const zod_1 = require("zod");
const convertArraySchema = (zodSchema, ref, opts) => {
    var _a, _b, _c;
    if (zodSchema._def.minLength) {
        (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`This schema defines an array minimum length check at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`);
    }
    if (zodSchema._def.maxLength) {
        (_b = opts.logger) === null || _b === void 0 ? void 0 : _b.debug(`This schema defines an array maximum length check at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`);
    }
    if (zodSchema._def.exactLength) {
        (_c = opts.logger) === null || _c === void 0 ? void 0 : _c.debug(`This schema defines an array exact length check at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`);
    }
    const innnerType = zodSchema._def.type;
    const innerTypeName = innnerType._def.typeName;
    if (innerTypeName === zod_1.ZodFirstPartyTypeKind.ZodAny ||
        innerTypeName === zod_1.ZodFirstPartyTypeKind.ZodUnknown) {
        return { type: Array, required: true };
    }
    const items = (0, __1.zodOneFieldSchema)(innnerType, { currentPath: [...ref.currentPath, "0"] }, opts);
    return { type: Array, items, required: true };
};
exports.convertArraySchema = convertArraySchema;
