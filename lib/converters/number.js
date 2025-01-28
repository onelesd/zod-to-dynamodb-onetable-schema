"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertNumberSchema = void 0;
const convertNumberSchema = (zodSchema, ref, opts) => {
    var _a;
    if (zodSchema._def.checks.length !== 0) {
        (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`This schema defines number checks at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`);
    }
    return { type: "number", required: true };
};
exports.convertNumberSchema = convertNumberSchema;
