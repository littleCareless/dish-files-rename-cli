export enum CaseType {
  SNAKE = "snake",
  CAMEL = "camel",
  PASCAL = "pascal",
  KEBAB = "kebab",
  DOT = "dot",
  SCREAMING_SNAKE = "screaming_snake",
  CAPITAL = "capital",
  CONSTANT = "constant",
  NO = "no",
  PASCAL_SNAKE = "pascal_snake",
  PATH = "path",
  SENTENCE = "sentence",
  TRAIN = "train",
}

export interface Options {
  recursive: boolean;
  prefix?: string;
  dryRun: boolean;
  to: CaseType;
  respectExcludes: boolean; // 新增选项：是否尊重.gitignore等排除规则
  updateImports: boolean; // 新增选项：是否更新文件中的import语句
  preservedWords?: string[]; // 新增选项：保留为单个单词不分割的词组列表
}

export type WordArray = string[];

// 用于保存不可分割单词列表的配置文件名
export const PRESERVED_WORDS_CONFIG_FILE = ".renamer-preserved-words.json";

// 保存不可分割单词列表的接口
export interface PreservedWordsConfig {
  words: string[]; // 不可分割的单词列表
}
