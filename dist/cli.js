"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseArgs = void 0;
const commander_1 = require("commander");
const types_1 = require("./types");
function parseArgs() {
    const program = new commander_1.Command();
    program
        .name("rename-files")
        .description("批量重命名文件,支持多种命名格式转换")
        .requiredOption("-f, --from <case>", "源文件名格式", validateCase)
        .requiredOption("-t, --to <case>", "目标文件名格式", validateCase)
        .option("-r, --recursive", "是否递归处理子目录", false)
        .option("-p, --prefix <prefix>", "添加文件名前缀")
        .option("-d, --dry-run", "试运行模式,不实际重命名", false);
    const opts = program.parse().opts();
    return {
        // from: opts.from,
        to: opts.to,
        recursive: opts.recursive,
        prefix: opts.prefix,
        dryRun: opts.dryRun,
    };
}
exports.parseArgs = parseArgs;
function validateCase(value) {
    if (Object.values(types_1.CaseType).includes(value)) {
        return value;
    }
    throw new Error(`Invalid case type: ${value}. ` +
        `Valid options are: ${Object.values(types_1.CaseType).join(", ")}`);
}
