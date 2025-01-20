"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameFiles = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const nameConverters_1 = require("./nameConverters");
async function renameFiles(dir, options) {
    const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const oldPath = path_1.default.join(dir, entry.name);
        if (entry.isDirectory() && options.recursive) {
            await renameFiles(oldPath, options);
            continue;
        }
        const { name, ext } = path_1.default.parse(entry.name);
        // 自动检测源文件格式
        const fromCase = (0, nameConverters_1.detectCase)(name);
        // 转换到目标格式
        const newName = (0, nameConverters_1.convertCase)(name, fromCase, options.to);
        // 添加前缀(如果有)
        const finalName = options.prefix
            ? `${options.prefix}${newName}`
            : newName;
        const newPath = path_1.default.join(dir, finalName + ext);
        // 检查是否已存在同名文件
        try {
            await promises_1.default.access(newPath);
            console.warn(`Warning: ${newPath} already exists, skipping...`);
            continue;
        }
        catch (_a) {
            // 文件不存在,可以安全重命名
            if (!options.dryRun) {
                await promises_1.default.rename(oldPath, newPath);
                console.log(`Renamed: ${oldPath} -> ${newPath}`);
            }
            else {
                console.log(`Will rename: ${oldPath} -> ${newPath}`);
            }
        }
    }
}
exports.renameFiles = renameFiles;
