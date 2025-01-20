import inquirer from "inquirer";
import { CaseType, Options } from "./types";

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
    const answers = await inquirer.prompt([
        {
            type: "list",
            name: "to",
            message: "请选择目标命名格式:",
            choices: Object.entries(caseTypeExamples).map(
                ([type, example]) => ({
                    name: `${type} (例如: ${example})`,
                    value: type,
                })
            ),
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
            name: "dryRun",
            message: "是否使用试运行模式(只显示会如何重命名,不实际执行)?",
            default: true,
        },
    ]);

    return {
        to: answers.to as CaseType,
        recursive: answers.recursive,
        prefix: answers.prefix || undefined,
        dryRun: answers.dryRun,
    };
}
