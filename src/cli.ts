import { Command } from "commander";
import { CaseType, Options } from "./types";

export function parseArgs(): Options {
  const program = new Command();

  program
    .name("rename-files")
    .description("批量重命名文件,支持多种命名格式转换")
    .requiredOption("-f, --from <case>", "源文件名格式", validateCase)
    .requiredOption("-t, --to <case>", "目标文件名格式", validateCase)
    .option("-r, --recursive", "是否递归处理子目录", false)
    .option("-p, --prefix <prefix>", "添加文件名前缀")
    .option("-d, --dry-run", "试运行模式,不实际重命名", false)
    .option("-e, --respect-excludes", "尊重.gitignore等排除规则", true)
    .option("-u, --update-imports", "更新文件中的import语句引用", true);

  const opts = program.parse().opts();

  return {
    // from: opts.from,
    to: opts.to,
    recursive: opts.recursive,
    prefix: opts.prefix,
    dryRun: opts.dryRun,
    respectExcludes: opts.respectExcludes,
    updateImports: opts.updateImports,
  };
}

function validateCase(value: string): CaseType {
  if (Object.values(CaseType).includes(value as CaseType)) {
    return value as CaseType;
  }
  throw new Error(
    `Invalid case type: ${value}. ` +
      `Valid options are: ${Object.values(CaseType).join(", ")}`
  );
}
