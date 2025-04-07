"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePreservedWords = exports.loadPreservedWords = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const types_1 = require("./types");
// 获取配置文件路径
function getConfigFilePath() {
    return path_1.default.join(process.cwd(), types_1.PRESERVED_WORDS_CONFIG_FILE);
}
// 加载已保存的不可分割单词列表
function loadPreservedWords() {
    const configPath = getConfigFilePath();
    try {
        // 检查配置文件是否存在
        if (fs_1.default.existsSync(configPath)) {
            const configData = fs_1.default.readFileSync(configPath, "utf-8");
            const config = JSON.parse(configData);
            return config.words || [];
        }
    }
    catch (error) {
        console.warn(`读取保留词配置失败: ${error instanceof Error ? error.message : String(error)}`);
    }
    // 默认返回一些常见的缩写词和专有名词
    return [
        "AI",
        "API",
        "REST",
        "UI",
        "URL",
        "XML",
        "JSON",
        "HTML",
        "CSS",
        "JS",
        "TS",
    ];
}
exports.loadPreservedWords = loadPreservedWords;
// 保存不可分割单词列表
function savePreservedWords(words) {
    const configPath = getConfigFilePath();
    try {
        // 确保单词列表中的单词都是大写的，以便于匹配
        const normalizedWords = words.map((word) => word.toUpperCase());
        // 创建配置对象
        const config = {
            words: normalizedWords,
        };
        // 写入配置文件
        fs_1.default.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
        console.log(`已保存${normalizedWords.length}个保留词到配置文件: ${configPath}`);
        return true;
    }
    catch (error) {
        console.error(`保存保留词配置失败: ${error instanceof Error ? error.message : String(error)}`);
        return false;
    }
}
exports.savePreservedWords = savePreservedWords;
