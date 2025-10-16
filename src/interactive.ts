import inquirer from "inquirer";
import { CaseType, Options } from "./types";
import { loadPreservedWords, savePreservedWords } from "./config";
import { initPreservedWords } from "./nameConverters";

const caseTypeExamples: Record<CaseType, string> = {
  snake: "two_words",
  screaming_snake: "TWO_WORDS",
  camel: "twoWords",
  pascal: "TwoWords",
  kebab: "two-words",
  dot: "two.words",
  capital: "Two Words",
  constant: "TWO_WORDS",
  no: "two words",
  pascal_snake: "Two_Words",
  path: "two/words",
  sentence: "Two words",
  train: "Two-Words",
};

export async function promptOptions(): Promise<Options> {
  // 加载当前保留词列表
  const currentPreservedWords = loadPreservedWords();

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "to",
      message: "请选择目标命名格式:",
      choices: Object.entries(caseTypeExamples).map(([type, example]) => ({
        name: `${type} (例如: ${example})`,
        value: type,
      })),
    },
    {
      type: "confirm",
      name: "recursive",
      message: "是否递归处理子目录?",
      default: false,
    },
    {
      type: "input",
      name: "prefix",
      message: "请输入文件名前缀(可选,直接回车跳过):",
      default: "",
    },
    {
      type: "confirm",
      name: "respectExcludes",
      message: "是否尊重 .gitignore 等排除规则?",
      default: true,
    },
    {
      type: "confirm",
      name: "updateImports",
      message: "是否自动更新文件中的 import 语句引用?",
      default: true,
    },
    {
      type: "confirm",
      name: "managePreservedWords",
      message: `是否管理保留词列表? 当前有 ${currentPreservedWords.length} 个保留词`,
      default: false,
    },
  ]);

  // 如果用户选择管理保留词列表
  let preservedWords = currentPreservedWords;
  if (answers.managePreservedWords) {
    preservedWords = await managePreservedWordsList(currentPreservedWords);
  }

  // 初始化保留词列表，确保在后续操作中使用
  initPreservedWords(preservedWords);

  return {
    to: answers.to as CaseType,
    recursive: answers.recursive,
    prefix: answers.prefix || undefined,
    dryRun: true, // 总是先试运行
    respectExcludes: answers.respectExcludes,
    updateImports: answers.updateImports,
    preservedWords: preservedWords,
  };
}

// 管理保留词列表的函数
async function managePreservedWordsList(
  currentWords: string[]
): Promise<string[]> {
  // 显示当前保留词列表
  console.log("\n当前保留词列表:");
  if (currentWords.length === 0) {
    console.log("(空)");
  } else {
    currentWords.forEach((word, index) => {
      console.log(`${index + 1}. ${word}`);
    });
  }

  // 询问用户要执行的操作
  const { action } = await inquirer.prompt({
    type: "list",
    name: "action",
    message: "请选择操作:",
    choices: [
      { name: "添加新的保留词", value: "add" },
      { name: "删除现有保留词", value: "remove" },
      { name: "编辑整个列表", value: "edit" },
      { name: "重置为默认列表", value: "reset" },
      { name: "返回不做修改", value: "back" },
    ],
  });

  let updatedWords = [...currentWords];

  switch (action) {
    case "add":
      const { newWord } = await inquirer.prompt({
        type: "input",
        name: "newWord",
        message: "请输入要添加的保留词(多个词用逗号分隔):",
        validate: (input) => input.trim() !== "" || "请输入有效的词",
      });

      // 解析并添加新词
      const wordsToAdd = newWord
        .split(",")
        .map((w: string) => w.trim())
        .filter((w: any) => w);
      updatedWords.push(...wordsToAdd);
      break;

    case "remove":
      if (updatedWords.length === 0) {
        console.log("列表为空，无法删除");
        break;
      }

      const { wordsToRemove } = await inquirer.prompt({
        type: "checkbox",
        name: "wordsToRemove",
        message: "选择要删除的保留词:",
        choices: updatedWords.map((word, index) => ({
          name: word,
          value: index,
        })),
      });

      // 从高索引到低索引删除，以避免索引偏移
      wordsToRemove.sort((a: number, b: number) => b - a);
      for (const index of wordsToRemove) {
        updatedWords.splice(index, 1);
      }
      break;

    case "edit":
      const { editedList } = await inquirer.prompt({
        type: "editor",
        name: "editedList",
        message: "编辑保留词列表(每行一个词):",
        default: updatedWords.join("\n"),
      });

      // 解析编辑后的列表
      updatedWords = editedList
        .split("\n")
        .map((line: string) => line.trim())
        .filter((line: string) => line && !line.startsWith("#"));
      break;

    case "reset":
      // 重置为默认列表
      updatedWords = [
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
      break;

    case "back":
      // 不做修改，直接返回
      return currentWords;
  }

  // 去重
  updatedWords = Array.from(new Set(updatedWords));

  // 保存更新后的列表
  savePreservedWords(updatedWords);

  console.log(`保留词列表已更新，现在有 ${updatedWords.length} 个保留词`);

  return updatedWords;
}

export async function confirmExecution(): Promise<boolean> {
  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: "试运行完成, 是否确认执行重命名?",
      default: false,
    },
  ]);
  return confirm;
}
