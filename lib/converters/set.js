"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertSetSchema = void 0;
const convertSetSchema = (_, ref, opts) => {
    var _a;
    /**
     * Learn more at [the `dynamodb-onetable` repo](https://github.com/sensedeep/dynamodb-onetable/blob/2de9a37c1d6b8c8ad466c1bf714c6f376040de66/src/Model.d.ts#L18)
     */
    (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`This schema defines a set at \`${ref.currentPath.join(".")}\`, OneTable supports sets, but their contents are untyped, this is a limitation of the \`dynamodb-onetable\` library`);
    return { type: Set, required: true };
};
exports.convertSetSchema = convertSetSchema;
