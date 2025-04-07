"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESERVED_WORDS_CONFIG_FILE = exports.CaseType = void 0;
var CaseType;
(function (CaseType) {
    CaseType["SNAKE"] = "snake";
    CaseType["CAMEL"] = "camel";
    CaseType["PASCAL"] = "pascal";
    CaseType["KEBAB"] = "kebab";
    CaseType["DOT"] = "dot";
    CaseType["SCREAMING_SNAKE"] = "screaming_snake";
    CaseType["CAPITAL"] = "capital";
    CaseType["CONSTANT"] = "constant";
    CaseType["NO"] = "no";
    CaseType["PASCAL_SNAKE"] = "pascal_snake";
    CaseType["PATH"] = "path";
    CaseType["SENTENCE"] = "sentence";
    CaseType["TRAIN"] = "train";
})(CaseType = exports.CaseType || (exports.CaseType = {}));
// 用于保存不可分割单词列表的配置文件名
exports.PRESERVED_WORDS_CONFIG_FILE = ".renamer-preserved-words.json";
