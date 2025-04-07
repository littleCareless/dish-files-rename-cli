"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertCase = exports.wordsToString = exports.stringToWords = exports.detectCase = exports.initPreservedWords = void 0;
const types_1 = require("./types");
const config_1 = require("./config");
// 获取保留词列表（不应被分割的词）
let preservedWords = [];
// 初始化保留词列表
function initPreservedWords(customWords) {
    // 如果提供了自定义词列表，则使用它，否则从配置文件加载
    preservedWords = customWords || (0, config_1.loadPreservedWords)();
    // 确保所有词都是大写的，以便匹配
    preservedWords = preservedWords.map((word) => word.toUpperCase());
}
exports.initPreservedWords = initPreservedWords;
// 自动检测命名格式
function detectCase(str) {
    // 优先检查分隔符
    if (str.includes("_")) {
        return str === str.toUpperCase()
            ? types_1.CaseType.SCREAMING_SNAKE
            : types_1.CaseType.SNAKE;
    }
    if (str.includes("-")) {
        return str === str.toLowerCase() ? types_1.CaseType.KEBAB : types_1.CaseType.TRAIN;
    }
    if (str.includes("."))
        return types_1.CaseType.DOT;
    if (str.includes("/"))
        return types_1.CaseType.PATH;
    if (str.includes(" ")) {
        if (str === str.toLowerCase())
            return types_1.CaseType.NO;
        return str[0] === str[0].toUpperCase()
            ? types_1.CaseType.CAPITAL
            : types_1.CaseType.SENTENCE;
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
// 字符串转成词组数组的通用函数
function stringToWords(str, fromCase) {
    // 初始化保留词列表（如果还未初始化）
    if (preservedWords.length === 0) {
        initPreservedWords();
    }
    switch (fromCase) {
        case types_1.CaseType.SNAKE:
        case types_1.CaseType.SCREAMING_SNAKE:
        case types_1.CaseType.CONSTANT:
            return str.toLowerCase().split("_");
        case types_1.CaseType.KEBAB:
        case types_1.CaseType.TRAIN:
            return str.split("-").map((s) => s.toLowerCase());
        case types_1.CaseType.DOT:
            return str.split(".").map((s) => s.toLowerCase());
        case types_1.CaseType.CAMEL:
        case types_1.CaseType.PASCAL:
        case types_1.CaseType.PASCAL_SNAKE:
            // 使用自定义分割函数处理保留词
            return splitByPreservedWords(str).map((s) => s.toLowerCase());
        case types_1.CaseType.CAPITAL:
        case types_1.CaseType.NO:
        case types_1.CaseType.SENTENCE:
            return str.toLowerCase().split(" ");
        case types_1.CaseType.PATH:
            return str.split("/").map((s) => s.toLowerCase());
        default:
            throw new Error(`Unsupported case type: ${fromCase}`);
    }
}
exports.stringToWords = stringToWords;
// 处理保留词的自定义分割函数
function splitByPreservedWords(input) {
    // 将输入字符串转换为大写以便匹配保留词
    const upperInput = input.toUpperCase();
    let matches = [];
    // 对每个保留词，查找它在输入字符串中的所有位置
    for (const word of preservedWords) {
        let pos = 0;
        while ((pos = upperInput.indexOf(word, pos)) !== -1) {
            // 确保这是一个完整的单词，前后应该是单词边界（大写字母或字符串边界）
            const beforeIsWordBoundary = pos === 0 || /[A-Z]/.test(upperInput.charAt(pos - 1));
            const afterIsWordBoundary = pos + word.length === upperInput.length ||
                /[A-Z]/.test(upperInput.charAt(pos + word.length));
            if (beforeIsWordBoundary && afterIsWordBoundary) {
                matches.push({
                    word,
                    start: pos,
                    end: pos + word.length,
                });
            }
            pos += 1; // 继续查找下一个匹配
        }
    }
    // 按起始位置排序匹配项
    matches.sort((a, b) => a.start - b.start);
    // 合并重叠的匹配
    const mergedMatches = [];
    for (const match of matches) {
        if (mergedMatches.length === 0) {
            mergedMatches.push(match);
            continue;
        }
        const lastMatch = mergedMatches[mergedMatches.length - 1];
        if (match.start <= lastMatch.end) {
            // 如果当前匹配与上一个重叠，合并它们
            if (match.end > lastMatch.end) {
                lastMatch.end = match.end;
                lastMatch.word = upperInput.substring(lastMatch.start, lastMatch.end);
            }
        }
        else {
            mergedMatches.push(match);
        }
    }
    // 创建一个标记数组，标记哪些位置不应该被分割
    const doNotSplitAt = new Array(input.length + 1).fill(false);
    // 对于每个保留词匹配，标记其中的位置不应该被分割
    for (const match of mergedMatches) {
        for (let i = match.start + 1; i < match.end; i++) {
            doNotSplitAt[i] = true;
        }
    }
    // 使用正则表达式在大写字母前分割，但保留保留词
    const words = [];
    let currentWord = "";
    for (let i = 0; i < input.length; i++) {
        const char = input.charAt(i);
        // 如果是大写字母并且不在保留词中间，则前面需要分割
        if (i > 0 && /[A-Z]/.test(char) && !doNotSplitAt[i]) {
            words.push(currentWord);
            currentWord = char;
        }
        else {
            currentWord += char;
        }
    }
    // 添加最后一个单词
    if (currentWord) {
        words.push(currentWord);
    }
    return words;
}
// 词组数组转成目标格式
function wordsToString(words, toCase) {
    switch (toCase) {
        case types_1.CaseType.SNAKE:
            return words.join("_");
        case types_1.CaseType.CONSTANT:
        case types_1.CaseType.SCREAMING_SNAKE:
            return words.map((w) => w.toUpperCase()).join("_");
        case types_1.CaseType.KEBAB:
            return words.join("-");
        case types_1.CaseType.DOT:
            return words.join(".");
        case types_1.CaseType.CAMEL:
            return (words[0].toLowerCase() + words.slice(1).map(capitalizeFirst).join(""));
        case types_1.CaseType.PASCAL:
            return words.map(capitalizeFirst).join("");
        case types_1.CaseType.CAPITAL:
            return words.map(capitalizeFirst).join(" ");
        case types_1.CaseType.NO:
            return words.join(" ");
        case types_1.CaseType.PASCAL_SNAKE:
            return words.map(capitalizeFirst).join("_");
        case types_1.CaseType.PATH:
            return words.join("/");
        case types_1.CaseType.SENTENCE:
            return capitalizeFirst(words.join(" "));
        case types_1.CaseType.TRAIN:
            return words.map(capitalizeFirst).join("-");
        default:
            throw new Error(`Unsupported case type: ${toCase}`);
    }
}
exports.wordsToString = wordsToString;
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
function convertCase(str, fromCase, toCase) {
    const words = stringToWords(str, fromCase);
    return wordsToString(words, toCase);
}
exports.convertCase = convertCase;
