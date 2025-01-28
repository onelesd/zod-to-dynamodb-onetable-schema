"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertStringSchema = exports.zodStringCheckPatterns = void 0;
exports.zodStringCheckPatterns = {
    cuid: /^[cC][^\s-]{8,}$/,
    cuid2: /^[0-9a-z]+$/,
    ulid: /^[0-9A-HJKMNP-TV-Z]{26}$/,
    email: 
    // eslint-disable-next-line no-useless-escape
    /^(?!\.)(?!.*\.\.)([a-zA-Z0-9_'+\-\.]*)[a-zA-Z0-9_+-]@([a-zA-Z0-9][a-zA-Z0-9\-]*\.)+[a-zA-Z]{2,}$/,
    emoji: RegExp("^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$", "u"),
    uuid: /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/,
    base64: /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/,
    nanoid: /^[a-zA-Z0-9_-]{21}$/,
    ip: /(\b25[0-5]|\b2[0-4][0-9]|\b[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}/,
};
const getStringValidators = (def, ref, opts) => {
    if (def.checks.length === 0)
        return [];
    const validators = def.checks
        .map((check) => {
        var _a;
        const staticRegex = exports.zodStringCheckPatterns[check.kind];
        if (staticRegex !== undefined)
            return { kind: check.kind, regex: staticRegex };
        switch (check.kind) {
            case "includes":
                return { kind: check.kind, regex: RegExp(check.value) };
            case "startsWith":
                return { kind: check.kind, regex: RegExp(`^${check.value}`) };
            case "endsWith":
                return { kind: check.kind, regex: RegExp(`${check.value}$`) };
            default:
                (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`Your schema defines a string ${check.kind} check at \`${ref.currentPath.join(".")}\` which is unsupported by this library`);
                return { kind: check.kind, regex: undefined };
        }
    })
        .filter((check) => check.regex !== undefined);
    if (validators.length === 0)
        return [];
    return validators;
};
const convertStringSchema = (zodSchema, ref, opts) => {
    var _a;
    const validators = getStringValidators(zodSchema._def, ref, opts);
    const validator = validators[0];
    if ((validators === null || validators === void 0 ? void 0 : validators.length) > 1) {
        (_a = opts.logger) === null || _a === void 0 ? void 0 : _a.debug(`This schema defines multiple checks at \`${ref.currentPath.join(".")}\`, but only one can be used, selecting first check: ${validator.kind}`);
    }
    return {
        type: "string",
        required: true,
        validate: (validator === null || validator === void 0 ? void 0 : validator.regex) ? validator.regex.toString() : undefined,
    };
};
exports.convertStringSchema = convertStringSchema;
