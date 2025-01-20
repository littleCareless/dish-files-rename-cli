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
}

export type WordArray = string[];
