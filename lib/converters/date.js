"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertDateSchema = void 0;
const convertDateSchema = (zodSchema, ref, opts) => {
    var _a;
    if (zodSchema._def.checks.length !== 0) {
        (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`This schema defines date checks at \`${ref.currentPath.join(".")}\`, but OneTable doesn't support this kind of validation`);
    }
    return { type: "date", required: true };
};
exports.convertDateSchema = convertDateSchema;
