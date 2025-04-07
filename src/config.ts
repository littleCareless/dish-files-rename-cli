import fs from "fs";
import path from "path";
import { PRESERVED_WORDS_CONFIG_FILE, PreservedWordsConfig } from "./types";

// 获取配置文件路径
function getConfigFilePath(): string {
  return path.join(process.cwd(), PRESERVED_WORDS_CONFIG_FILE);
}

// 加载已保存的不可分割单词列表
export function loadPreservedWords(): string[] {
  const configPath = getConfigFilePath();

  try {
    // 检查配置文件是否存在
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, "utf-8");
      const config: PreservedWordsConfig = JSON.parse(configData);
      return config.words || [];
    }
  } catch (error) {
    console.warn(
      `读取保留词配置失败: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
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

// 保存不可分割单词列表
export function savePreservedWords(words: string[]): boolean {
  const configPath = getConfigFilePath();

  try {
    // 确保单词列表中的单词都是大写的，以便于匹配
    const normalizedWords = words.map((word) => word.toUpperCase());

    // 创建配置对象
    const config: PreservedWordsConfig = {
      words: normalizedWords,
    };

    // 写入配置文件
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");
    console.log(
      `已保存${normalizedWords.length}个保留词到配置文件: ${configPath}`
    );
    return true;
  } catch (error) {
    console.error(
      `保存保留词配置失败: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
    return false;
  }
}
