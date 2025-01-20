"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCase = exports.detectCase = exports.wordsToString = exports.stringToWords = void 0;
const types_1 = require("./types");
// 字符串转成词组数组的通用函数
function stringToWords(str, fromCase) {
    switch (fromCase) {
        case types_1.CaseType.SNAKE:
        case types_1.CaseType.SCREAMING_SNAKE:
        case types_1.CaseType.CONSTANT:
            return str.toLowerCase().split('_');
        case types_1.CaseType.KEBAB:
        case types_1.CaseType.TRAIN:
            return str.split('-').map(s => s.toLowerCase());
        case types_1.CaseType.DOT:
            return str.split('.').map(s => s.toLowerCase());
        case types_1.CaseType.CAMEL:
        case types_1.CaseType.PASCAL:
        case types_1.CaseType.PASCAL_SNAKE:
            return str.split(/(?=[A-Z])/).map(s => s.toLowerCase());
        case types_1.CaseType.CAPITAL:
        case types_1.CaseType.NO:
        case types_1.CaseType.SENTENCE:
            return str.toLowerCase().split(' ');
        case types_1.CaseType.PATH:
            return str.split('/').map(s => s.toLowerCase());
        default:
            throw new Error(`Unsupported case type: ${fromCase}`);
    }
}
exports.stringToWords = stringToWords;
// 词组数组转成目标格式
function wordsToString(words, toCase) {
    switch (toCase) {
        case types_1.CaseType.SNAKE:
            return words.join('_');
        case types_1.CaseType.CONSTANT:
        case types_1.CaseType.SCREAMING_SNAKE:
            return words.map(w => w.toUpperCase()).join('_');
        case types_1.CaseType.KEBAB:
            return words.join('-');
        case types_1.CaseType.DOT:
            return words.join('.');
        case types_1.CaseType.CAMEL:
            return words[0].toLowerCase() +
                words.slice(1).map(capitalizeFirst).join('');
        case types_1.CaseType.PASCAL:
            return words.map(capitalizeFirst).join('');
        case types_1.CaseType.CAPITAL:
            return words.map(capitalizeFirst).join(' ');
        case types_1.CaseType.NO:
            return words.join(' ');
        case types_1.CaseType.PASCAL_SNAKE:
            return words.map(capitalizeFirst).join('_');
        case types_1.CaseType.PATH:
            return words.join('/');
        case types_1.CaseType.SENTENCE:
            return capitalizeFirst(words.join(' '));
        case types_1.CaseType.TRAIN:
            return words.map(capitalizeFirst).join('-');
        default:
            throw new Error(`Unsupported case type: ${toCase}`);
    }
}
exports.wordsToString = wordsToString;
// 自动检测命名格式
function detectCase(str) {
    // 优先检查分隔符
    if (str.includes('_')) {
        return str === str.toUpperCase() ? types_1.CaseType.SCREAMING_SNAKE : types_1.CaseType.SNAKE;
    }
    if (str.includes('-')) {
        return str === str.toLowerCase() ? types_1.CaseType.KEBAB : types_1.CaseType.TRAIN;
    }
    if (str.includes('.'))
        return types_1.CaseType.DOT;
    if (str.includes('/'))
        return types_1.CaseType.PATH;
    if (str.includes(' ')) {
        if (str === str.toLowerCase())
            return types_1.CaseType.NO;
        return str[0] === str[0].toUpperCase() ? types_1.CaseType.CAPITAL : types_1.CaseType.SENTENCE;
    }
    // 检查大小写特征
    if (str === str.toUpperCase())
        return types_1.CaseType.CONSTANT;
    if (str[0] === str[0].toUpperCase())
        return types_1.CaseType.PASCAL;
    if (/[A-Z]/.test(str))
        return types_1.CaseType.CAMEL;
    // 默认使用snake_case
    return types_1.CaseType.SNAKE;
}
exports.detectCase = detectCase;
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function convertCase(str, fromCase, toCase) {
    const words = stringToWords(str, fromCase);
    return wordsToString(words, toCase);
}
exports.convertCase = convertCase;
