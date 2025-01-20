import fs from 'fs/promises';
import path from 'path';
import { CaseType, Options } from './types';
import { convertCase, detectCase } from './nameConverters';

export async function renameFiles(
  dir: string,
  options: Options
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);

    if (entry.isDirectory() && options.recursive) {
      await renameFiles(oldPath, options);
      continue;
    }

    const { name, ext } = path.parse(entry.name);

    // 自动检测源文件格式
    const fromCase = detectCase(name);
    // 转换到目标格式
    const newName = convertCase(name, fromCase, options.to);

    // 添加前缀(如果有)
    const finalName = options.prefix
      ? `${options.prefix}${newName}`
      : newName;

    const newPath = path.join(dir, finalName + ext);

    // 检查是否已存在同名文件
    try {
      await fs.access(newPath);
      console.warn(`Warning: ${newPath} already exists, skipping...`);
      continue;
    } catch {
      // 文件不存在,可以安全重命名
      if (!options.dryRun) {
        await fs.rename(oldPath, newPath);
        console.log(`Renamed: ${oldPath} -> ${newPath}`);
      } else {
        console.log(`Will rename: ${oldPath} -> ${newPath}`);
      }
    }
  }
}
