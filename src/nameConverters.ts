import { CaseType, WordArray } from './types';

// 字符串转成词组数组的通用函数
export function stringToWords(str: string, fromCase: CaseType): WordArray {
  switch(fromCase) {
    case CaseType.SNAKE:
    case CaseType.SCREAMING_SNAKE:
    case CaseType.CONSTANT:
      return str.toLowerCase().split('_');
    case CaseType.KEBAB:
    case CaseType.TRAIN:
      return str.split('-').map(s => s.toLowerCase());
    case CaseType.DOT:
      return str.split('.').map(s => s.toLowerCase());
    case CaseType.CAMEL:
    case CaseType.PASCAL:
    case CaseType.PASCAL_SNAKE:
      return str.split(/(?=[A-Z])/).map(s => s.toLowerCase());
    case CaseType.CAPITAL:
    case CaseType.NO:
    case CaseType.SENTENCE:
      return str.toLowerCase().split(' ');
    case CaseType.PATH:
      return str.split('/').map(s => s.toLowerCase());
    default:
      throw new Error(`Unsupported case type: ${fromCase}`);
  }
}

// 词组数组转成目标格式
export function wordsToString(words: WordArray, toCase: CaseType): string {
  switch(toCase) {
    case CaseType.SNAKE:
      return words.join('_');
    case CaseType.CONSTANT:
    case CaseType.SCREAMING_SNAKE:
      return words.map(w => w.toUpperCase()).join('_');
    case CaseType.KEBAB:
      return words.join('-');
    case CaseType.DOT:
      return words.join('.');
    case CaseType.CAMEL:
      return words[0].toLowerCase() +
        words.slice(1).map(capitalizeFirst).join('');
    case CaseType.PASCAL:
      return words.map(capitalizeFirst).join('');
    case CaseType.CAPITAL:
      return words.map(capitalizeFirst).join(' ');
    case CaseType.NO:
      return words.join(' ');
    case CaseType.PASCAL_SNAKE:
      return words.map(capitalizeFirst).join('_');
    case CaseType.PATH:
      return words.join('/');
    case CaseType.SENTENCE:
      return capitalizeFirst(words.join(' '));
    case CaseType.TRAIN:
      return words.map(capitalizeFirst).join('-');
    default:
      throw new Error(`Unsupported case type: ${toCase}`);
  }
}

// 自动检测命名格式
export function detectCase(str: string): CaseType {
  // 优先检查分隔符
  if (str.includes('_')) {
    return str === str.toUpperCase() ? CaseType.SCREAMING_SNAKE : CaseType.SNAKE;
  }
  if (str.includes('-')) {
    return str === str.toLowerCase() ? CaseType.KEBAB : CaseType.TRAIN;
  }
  if (str.includes('.')) return CaseType.DOT;
  if (str.includes('/')) return CaseType.PATH;
  if (str.includes(' ')) {
    if (str === str.toLowerCase()) return CaseType.NO;
    return str[0] === str[0].toUpperCase() ? CaseType.CAPITAL : CaseType.SENTENCE;
  }

  // 检查大小写特征
  if (str === str.toUpperCase()) return CaseType.CONSTANT;
  if (str[0] === str[0].toUpperCase()) return CaseType.PASCAL;
  if (/[A-Z]/.test(str)) return CaseType.CAMEL;

  // 默认使用snake_case
  return CaseType.SNAKE;
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
