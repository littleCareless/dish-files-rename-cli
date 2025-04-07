import { CaseType, WordArray } from "./types";
import { loadPreservedWords } from "./config";

// 获取保留词列表（不应被分割的词）
let preservedWords: string[] = [];

// 初始化保留词列表
export function initPreservedWords(customWords?: string[]): void {
  // 如果提供了自定义词列表，则使用它，否则从配置文件加载
  preservedWords = customWords || loadPreservedWords();
  // 确保所有词都是大写的，以便匹配
  preservedWords = preservedWords.map((word) => word.toUpperCase());
}

// 自动检测命名格式
export function detectCase(str: string): CaseType {
  // 优先检查分隔符
  if (str.includes("_")) {
    return str === str.toUpperCase()
      ? CaseType.SCREAMING_SNAKE
      : CaseType.SNAKE;
  }
  if (str.includes("-")) {
    return str === str.toLowerCase() ? CaseType.KEBAB : CaseType.TRAIN;
  }
  if (str.includes(".")) return CaseType.DOT;
  if (str.includes("/")) return CaseType.PATH;
  if (str.includes(" ")) {
    if (str === str.toLowerCase()) return CaseType.NO;
    return str[0] === str[0].toUpperCase()
      ? CaseType.CAPITAL
      : CaseType.SENTENCE;
  }

  // 检查大小写特征
  if (str === str.toUpperCase()) return CaseType.CONSTANT;
  if (str[0] === str[0].toUpperCase()) return CaseType.PASCAL;
  if (/[A-Z]/.test(str)) return CaseType.CAMEL;

  // 默认使用snake_case
  return CaseType.SNAKE;
}

// 字符串转成词组数组的通用函数
export function stringToWords(str: string, fromCase: CaseType): WordArray {
  // 初始化保留词列表（如果还未初始化）
  if (preservedWords.length === 0) {
    initPreservedWords();
  }

  switch (fromCase) {
    case CaseType.SNAKE:
    case CaseType.SCREAMING_SNAKE:
    case CaseType.CONSTANT:
      return str.toLowerCase().split("_");
    case CaseType.KEBAB:
    case CaseType.TRAIN:
      return str.split("-").map((s) => s.toLowerCase());
    case CaseType.DOT:
      return str.split(".").map((s) => s.toLowerCase());
    case CaseType.CAMEL:
    case CaseType.PASCAL:
    case CaseType.PASCAL_SNAKE:
      // 使用自定义分割函数处理保留词
      return splitByPreservedWords(str).map((s) => s.toLowerCase());
    case CaseType.CAPITAL:
    case CaseType.NO:
    case CaseType.SENTENCE:
      return str.toLowerCase().split(" ");
    case CaseType.PATH:
      return str.split("/").map((s) => s.toLowerCase());
    default:
      throw new Error(`Unsupported case type: ${fromCase}`);
  }
}

// 处理保留词的自定义分割函数
function splitByPreservedWords(input: string): string[] {
  // 将输入字符串转换为大写以便匹配保留词
  const upperInput = input.toUpperCase();

  // 先找出所有可能的保留词的位置
  type WordMatch = {
    word: string;
    start: number;
    end: number;
  };

  let matches: WordMatch[] = [];

  // 对每个保留词，查找它在输入字符串中的所有位置
  for (const word of preservedWords) {
    let pos = 0;
    while ((pos = upperInput.indexOf(word, pos)) !== -1) {
      // 确保这是一个完整的单词，前后应该是单词边界（大写字母或字符串边界）
      const beforeIsWordBoundary =
        pos === 0 || /[A-Z]/.test(upperInput.charAt(pos - 1));
      const afterIsWordBoundary =
        pos + word.length === upperInput.length ||
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
  const mergedMatches: WordMatch[] = [];
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
    } else {
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
  const words: string[] = [];
  let currentWord = "";

  for (let i = 0; i < input.length; i++) {
    const char = input.charAt(i);

    // 如果是大写字母并且不在保留词中间，则前面需要分割
    if (i > 0 && /[A-Z]/.test(char) && !doNotSplitAt[i]) {
      words.push(currentWord);
      currentWord = char;
    } else {
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
export function wordsToString(words: WordArray, toCase: CaseType): string {
  switch (toCase) {
    case CaseType.SNAKE:
      return words.join("_");
    case CaseType.CONSTANT:
    case CaseType.SCREAMING_SNAKE:
      return words.map((w) => w.toUpperCase()).join("_");
    case CaseType.KEBAB:
      return words.join("-");
    case CaseType.DOT:
      return words.join(".");
    case CaseType.CAMEL:
      return (
        words[0].toLowerCase() + words.slice(1).map(capitalizeFirst).join("")
      );
    case CaseType.PASCAL:
      return words.map(capitalizeFirst).join("");
    case CaseType.CAPITAL:
      return words.map(capitalizeFirst).join(" ");
    case CaseType.NO:
      return words.join(" ");
    case CaseType.PASCAL_SNAKE:
      return words.map(capitalizeFirst).join("_");
    case CaseType.PATH:
      return words.join("/");
    case CaseType.SENTENCE:
      return capitalizeFirst(words.join(" "));
    case CaseType.TRAIN:
      return words.map(capitalizeFirst).join("-");
    default:
      throw new Error(`Unsupported case type: ${toCase}`);
  }
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function convertCase(
  str: string,
  fromCase: CaseType,
  toCase: CaseType
): string {
  const words = stringToWords(str, fromCase);
  return wordsToString(words, toCase);
}
