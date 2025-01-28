"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertRecordSchema = void 0;
const convertRecordSchema = (_, ref, opts) => {
    var _a;
    (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`A record is specified at \`${ref.currentPath.join(".")}\`. Records cannot only be represented as a generic object in OneTable, so it will be typed as \`Record<any, any>\` instead, clobbering typing on all internal keys and values.`);
    return { type: "object", required: true };
};
exports.convertRecordSchema = convertRecordSchema;
