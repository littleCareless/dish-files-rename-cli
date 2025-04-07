"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renameFiles = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const micromatch_1 = __importDefault(require("micromatch"));
const nameConverters_1 = require("./nameConverters");
// 记录重命名的文件映射: { 旧路径: 新路径 }
let renamedFiles = new Map();
// 内置排除的配置文件列表
const BUILT_IN_EXCLUDE_FILES = [
    // 版本控制
    ".gitignore",
    ".gitattributes",
    ".git",
    ".svn",
    ".hg",
    ".github",
    ".gitlab",
    ".gitlab-ci.yml",
    ".versionrc",
    ".nvmrc",
    "CODEOWNERS",
    // 包管理
    ".npmrc",
    ".npmignore",
    ".pnpm-lock.yaml",
    ".yarnrc",
    ".yarnrc.yml",
    ".yarn",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "node_modules",
    "bun.lockb",
    ".npmignore",
    "Cargo.toml",
    "Cargo.lock",
    "Gemfile",
    "Gemfile.lock",
    "go.mod",
    "go.sum",
    "poetry.lock",
    "pyproject.toml",
    "requirements.txt",
    "composer.json",
    "composer.lock",
    // 代码质量与风格
    ".eslintrc",
    ".eslintrc.js",
    ".eslintrc.json",
    ".eslintrc.yml",
    ".eslintrc.yaml",
    "eslint.config.js",
    "eslint.config.mjs",
    ".prettierrc",
    ".prettierrc.js",
    ".prettierrc.json",
    ".prettierrc.yml",
    ".prettierrc.toml",
    "prettier.config.js",
    "prettier.config.mjs",
    ".stylelintrc",
    ".stylelintrc.json",
    ".stylelintrc.js",
    ".stylelintrc.yml",
    "stylelint.config.js",
    "stylelint.config.mjs",
    ".editorconfig",
    ".markdownlint.json",
    ".markdownlintrc",
    ".jshintrc",
    ".csslintrc",
    ".sasslintrc",
    ".htmlhintrc",
    "commitlint.config.js",
    "commitlint.config.mjs",
    "commitlint-config.mjs",
    ".commitlintrc",
    ".commitlintrc.js",
    ".commitlintrc.json",
    ".commitlintrc.yml",
    "lint-staged.config.js",
    "lint-staged.config.mjs",
    ".lintstagedrc",
    ".lintstagedrc.js",
    ".lintstagedrc.json",
    ".lintstagedrc.yml",
    // 构建和配置
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.spec.json",
    "tsconfig.build.json",
    "tsconfig.node.json",
    "tsconfig.eslint.json",
    "jsconfig.json",
    ".babelrc",
    ".babelrc.js",
    ".babelrc.json",
    "babel.config.js",
    "babel.config.json",
    "webpack.config.js",
    "webpack.config.ts",
    "webpack.config.babel.js",
    "webpack.common.js",
    "webpack.dev.js",
    "webpack.prod.js",
    "rollup.config.js",
    "rollup.config.ts",
    "rollup.config.mjs",
    "vite.config.js",
    "vite.config.ts",
    "vite.config.mjs",
    "svelte.config.js",
    "svelte.config.mjs",
    "nuxt.config.js",
    "nuxt.config.ts",
    "next.config.js",
    "next.config.mjs",
    "ember-cli-build.js",
    "angular.json",
    ".browserslistrc",
    "browserslist",
    "turbo.json",
    "nx.json",
    "remix.config.js",
    "astro.config.mjs",
    "astro.config.ts",
    "vitest.config.js",
    "vitest.config.ts",
    "tailwind.config.js",
    "tailwind.config.ts",
    "postcss.config.js",
    "postcss.config.mjs",
    ".postcssrc",
    ".postcssrc.js",
    ".postcssrc.json",
    ".postcssrc.yml",
    ".storybook",
    "deno.json",
    "deno.jsonc",
    "esbuild.config.js",
    "esbuild.config.mjs",
    // 测试
    "jest.config.js",
    "jest.config.ts",
    "jest.config.mjs",
    "jest.setup.js",
    "jest.setup.ts",
    ".jestrc",
    ".jest.config.js",
    ".mocharc.js",
    ".mocharc.json",
    ".mocharc.yml",
    "mocha.opts",
    "karma.conf.js",
    ".nycrc",
    ".nycrc.json",
    ".nycrc.yml",
    "cypress.json",
    "cypress.config.js",
    "cypress.config.ts",
    "cypress.config.mjs",
    "playwright.config.js",
    "playwright.config.ts",
    "wdio.conf.js",
    "wdio.conf.ts",
    "codecov.yml",
    ".coveralls.yml",
    "ava.config.js",
    "ava.config.mjs",
    "vitest.config.js",
    "vitest.config.ts",
    // 环境变量
    ".env",
    ".env.local",
    ".env.development",
    ".env.staging",
    ".env.production",
    ".env.test",
    ".env.example",
    ".env.template",
    ".env.defaults",
    ".env.development.local",
    ".env.production.local",
    ".env.test.local",
    // 容器和CI/CD
    "Dockerfile",
    "Dockerfile.dev",
    "Dockerfile.prod",
    "docker-compose.yml",
    "docker-compose.yaml",
    "docker-compose.dev.yml",
    "docker-compose.prod.yml",
    "docker-compose.override.yml",
    ".dockerignore",
    ".devcontainer",
    ".travis.yml",
    ".github",
    ".gitlab-ci.yml",
    ".circleci",
    "circle.ci",
    "bitbucket-pipelines.yml",
    "appveyor.yml",
    "azure-pipelines.yml",
    "buildkite.yml",
    ".buildkite",
    "Jenkinsfile",
    ".jenkins",
    ".drone.yml",
    "cloudbuild.yaml",
    ".buildpacks",
    "heroku.yml",
    "Procfile",
    ".spaceignore",
    "vercel.json",
    "netlify.toml",
    "firebase.json",
    ".firebaserc",
    "now.json",
    "amplify.yml",
    ".github/workflows",
    ".github/actions",
    // 编辑器配置
    ".vscode",
    ".vscode-test",
    ".vscodeignore",
    ".idea",
    ".vs",
    ".sublime",
    ".atom",
    ".nova",
    "*.code-workspace",
    "*.sublime-project",
    "*.sublime-workspace",
    ".editorconfig",
    // 文档
    "README.md",
    "CONTRIBUTING.md",
    "LICENSE",
    "LICENSE.md",
    "CHANGELOG.md",
    "CHANGELOG",
    "SECURITY.md",
    "CODE_OF_CONDUCT.md",
    "CODEOWNERS",
    "AUTHORS",
    "AUTHORS.md",
    "NOTICE",
    "NOTICE.md",
    "PATENTS",
    "PATENTS.md",
    "BACKERS.md",
    "SUPPORTERS.md",
    "SPONSORS.md",
    "docs",
    "documentation",
    "_site",
    "site",
    "website",
    // 其他通用配置文件
    ".ignore",
    ".husky",
    ".huskyrc",
    ".huskyrc.js",
    ".huskyrc.json",
    ".huskyrc.yml",
    "husky.config.js",
    ".czrc",
    ".cz.json",
    ".cz-config.js",
    ".commitrc",
    ".releaserc",
    ".releaserc.js",
    ".releaserc.json",
    ".releaserc.yml",
    "release.config.js",
    "release-config.js",
    "semantic-release.config.js",
    ".semantic-release.json",
    ".appveyor.yml",
    ".bsb.lock",
    ".buckconfig",
    ".dependabot",
    ".gcloudignore",
    ".flowconfig",
    ".sentryclirc",
    ".watchmanconfig",
    ".asf.yaml",
    ".lfsconfig",
    ".size-limit.js",
    ".yamllint",
    ".remarkrc",
    ".renovaterc",
    "renovate.json",
    "bsconfig.json",
    "Thumbs.db",
    ".DS_Store",
    "desktop.ini",
    ".tool-versions",
    ".ruby-version",
    ".python-version",
    ".node-version",
    ".terraform",
    ".pnp.js",
    ".pnp.cjs",
    ".parcel-cache",
    ".next",
    ".nuxt",
    ".cache",
    ".output",
    "dist",
    "build",
    "coverage",
    ".tmp",
    "tmp",
    "temp",
    "logs",
    "log",
    "__pycache__",
    "*.pyc",
    "*.pyo",
    "*.pyd",
    "*.so",
    "*.dylib",
    "*.dll",
    "*.class",
    "*.exe",
    "*.o",
    "*.a",
    "*.out",
];
// 读取并解析排除文件(如.gitignore)
async function readExcludePatterns(dir) {
    const excludeFiles = [".gitignore", ".ignore", ".npmignore"];
    let patterns = [];
    for (const excludeFile of excludeFiles) {
        const filePath = path_1.default.join(dir, excludeFile);
        if ((0, fs_1.existsSync)(filePath)) {
            const content = (0, fs_1.readFileSync)(filePath, "utf-8");
            const lines = content
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line && !line.startsWith("#"));
            patterns.push(...lines);
        }
    }
    return patterns;
}
// 检查路径是否应该被排除
function shouldExclude(filePath, baseDir, patterns) {
    // 检查文件名是否在内置排除列表中
    const fileName = path_1.default.basename(filePath);
    if (BUILT_IN_EXCLUDE_FILES.includes(fileName)) {
        return true;
    }
    // 检查文件目录是否在内置排除列表中
    const dirName = path_1.default.basename(path_1.default.dirname(filePath));
    if (BUILT_IN_EXCLUDE_FILES.includes(dirName)) {
        return true;
    }
    if (patterns.length === 0) {
        return false;
    }
    // 获取相对于基础目录的路径
    const relativePath = path_1.default.relative(baseDir, filePath);
    // 使用micromatch检查路径是否匹配任何排除模式
    return micromatch_1.default.isMatch(relativePath, patterns);
}
// 更新文件中的 import 语句
async function updateImportStatements(dir, options) {
    if (!options.updateImports || options.dryRun) {
        return;
    }
    // 统计更新信息
    let totalFilesScanned = 0;
    let totalFilesUpdated = 0;
    let totalImportsUpdated = 0;
    let updatedImportDetails = [];
    const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const filePath = path_1.default.join(dir, entry.name);
        // 如果是目录且需要递归处理
        if (entry.isDirectory() && options.recursive) {
            await updateImportStatements(filePath, options);
            continue;
        }
        // 处理 .ts、.js、.tsx 和 .jsx 文件
        const { ext } = path_1.default.parse(entry.name);
        if (![".ts", ".js", ".tsx", ".jsx"].includes(ext)) {
            continue;
        }
        totalFilesScanned++;
        // 读取文件内容
        let content;
        try {
            content = await promises_1.default.readFile(filePath, "utf-8");
        }
        catch (error) {
            console.error(`Error reading file: ${filePath}`, error);
            continue;
        }
        let modified = false;
        let importsUpdated = 0;
        let fileImportDetails = [];
        // 匹配各种 import 语句模式
        // 1. 普通导入: import { x } from './file';
        // 2. 默认导入: import x from './file';
        // 3. 命名空间导入: import * as x from './file';
        // 4. 类型导入: import type { x } from './file';
        // 5. 混合导入: import x, { y } from './file';
        // 6. CSS/SCSS导入: import './styles.css';
        const importRegex = /import\s+(?:(?:type\s+)?(?:(?:[^{},\s]+)\s*,\s*)?(?:(?:\*\s+as\s+[^{},\s]+)|(?:{[^{}]*?}))?\s*from\s*)?['"]([^'"]+)['"]/g;
        // 匹配动态导入: import('./file')
        const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
        // 匹配 require 语句: require('./file')
        const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
        // 更新普通 import 语句
        let newContent = content.replace(importRegex, (match, importPath) => {
            const result = updateImportPath(importPath, filePath);
            if (result.updated) {
                modified = true;
                importsUpdated++;
                fileImportDetails.push({
                    oldImport: importPath,
                    newImport: result.newPath,
                });
                return match.replace(importPath, result.newPath);
            }
            return match;
        });
        // 更新动态 import 语句
        newContent = newContent.replace(dynamicImportRegex, (match, importPath) => {
            const result = updateImportPath(importPath, filePath);
            if (result.updated) {
                modified = true;
                importsUpdated++;
                fileImportDetails.push({
                    oldImport: importPath,
                    newImport: result.newPath,
                });
                return match.replace(importPath, result.newPath);
            }
            return match;
        });
        // 更新 require 语句
        newContent = newContent.replace(requireRegex, (match, importPath) => {
            const result = updateImportPath(importPath, filePath);
            if (result.updated) {
                modified = true;
                importsUpdated++;
                fileImportDetails.push({
                    oldImport: importPath,
                    newImport: result.newPath,
                });
                return match.replace(importPath, result.newPath);
            }
            return match;
        });
        // 如果文件被修改，写回文件
        if (modified) {
            try {
                (0, fs_1.writeFileSync)(filePath, newContent, "utf-8");
                console.log(`Updated ${importsUpdated} imports in: ${filePath}`);
                // 记录详细的导入更新信息
                fileImportDetails.forEach((detail) => {
                    console.log(`  - ${detail.oldImport} → ${detail.newImport}`);
                    updatedImportDetails.push({
                        file: filePath,
                        oldImport: detail.oldImport,
                        newImport: detail.newImport,
                    });
                });
                totalFilesUpdated++;
                totalImportsUpdated += importsUpdated;
            }
            catch (error) {
                console.error(`Error writing file: ${filePath}`, error);
            }
        }
    }
    // 打印更新统计信息
    if (totalFilesUpdated > 0) {
        console.log(`\n--- Import Statements Update Summary ---`);
        console.log(`Files scanned: ${totalFilesScanned}`);
        console.log(`Files updated: ${totalFilesUpdated}`);
        console.log(`Import statements updated: ${totalImportsUpdated}`);
        // 输出按文件分组的详细更新日志
        if (updatedImportDetails.length > 0) {
            console.log(`\nDetailed Update Log:`);
            const fileGroups = new Map();
            updatedImportDetails.forEach((detail) => {
                if (!fileGroups.has(detail.file)) {
                    fileGroups.set(detail.file, []);
                }
                fileGroups.get(detail.file).push({
                    oldImport: detail.oldImport,
                    newImport: detail.newImport,
                });
            });
            for (const [file, details] of fileGroups.entries()) {
                console.log(`\n${file}:`);
                details.forEach((d) => {
                    console.log(`  ${d.oldImport} → ${d.newImport}`);
                });
            }
        }
        console.log(`------------------------------------\n`);
    }
}
// 辅助函数：更新导入路径
function updateImportPath(importPath, filePath) {
    // 处理相对路径导入
    if (importPath.startsWith("./") || importPath.startsWith("../")) {
        // 获取导入文件的绝对路径
        const importDir = path_1.default.dirname(filePath);
        const absoluteImportPath = path_1.default.resolve(importDir, importPath);
        // 检查导入的是否是一个目录
        let isDirectory = false;
        try {
            const stats = (0, fs_1.existsSync)(absoluteImportPath) && (0, fs_1.statSync)(absoluteImportPath);
            isDirectory = stats && stats.isDirectory();
        }
        catch (_a) {
            // 如果文件不存在，可能是导入了没有扩展名的文件
            isDirectory = false;
        }
        // 如果是目录，添加各种可能的索引文件
        let checkPaths = [];
        if (isDirectory) {
            // 添加各种可能的索引文件
            checkPaths.push(path_1.default.join(absoluteImportPath, "index.ts"));
            checkPaths.push(path_1.default.join(absoluteImportPath, "index.js"));
            checkPaths.push(path_1.default.join(absoluteImportPath, "index.tsx"));
            checkPaths.push(path_1.default.join(absoluteImportPath, "index.jsx"));
        }
        else {
            // 尝试添加各种可能的扩展名
            checkPaths.push(`${absoluteImportPath}.ts`);
            checkPaths.push(`${absoluteImportPath}.js`);
            checkPaths.push(`${absoluteImportPath}.tsx`);
            checkPaths.push(`${absoluteImportPath}.jsx`);
            checkPaths.push(`${absoluteImportPath}.css`);
            checkPaths.push(`${absoluteImportPath}.scss`);
            checkPaths.push(absoluteImportPath);
        }
        // 检查这些路径是否在我们的重命名映射中
        for (const [oldPath, newPath] of renamedFiles.entries()) {
            for (const checkPath of checkPaths) {
                if (checkPath === oldPath) {
                    // 找到了被重命名的文件
                    const newRelativePath = path_1.default
                        .relative(importDir, newPath)
                        .replace(/\\/g, "/"); // 确保在 Windows 上使用正斜杠
                    // 如果不是以 ./ 或 ../ 开头，添加 ./
                    const prefixedPath = newRelativePath.startsWith(".")
                        ? newRelativePath
                        : `./${newRelativePath}`;
                    // 对于CSS/SCSS文件，保留扩展名，对于JS/TS文件移除扩展名
                    const extension = path_1.default.extname(newPath).toLowerCase();
                    if ([".css", ".scss"].includes(extension)) {
                        return { updated: true, newPath: prefixedPath };
                    }
                    // 移除JS/TS相关扩展名
                    const pathWithoutExt = prefixedPath.replace(/\.(js|ts|jsx|tsx)$/, "");
                    return { updated: true, newPath: pathWithoutExt };
                }
            }
        }
    }
    return { updated: false, newPath: importPath }; // 如果没有找到对应的重命名文件，保持不变
}
async function renameFiles(dir, options) {
    // 重置重命名映射
    renamedFiles = new Map();
    // 确保初始化保留词列表
    (0, nameConverters_1.initPreservedWords)(options.preservedWords);
    // 读取排除模式
    const excludePatterns = options.respectExcludes
        ? await readExcludePatterns(dir)
        : [];
    // 第一步：收集所有需要重命名的文件
    await collectRenamingMap(dir, options, excludePatterns);
    // 第二步：执行重命名操作
    await executeRenaming(options);
    // 第三步：更新 import 语句（如果启用）
    if (options.updateImports && !options.dryRun) {
        await updateImportStatements(dir, options);
    }
}
exports.renameFiles = renameFiles;
// 收集重命名映射
async function collectRenamingMap(dir, options, excludePatterns) {
    const entries = await promises_1.default.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
        const oldPath = path_1.default.join(dir, entry.name);
        // 检查是否应该排除该路径
        if (options.respectExcludes &&
            shouldExclude(oldPath, process.cwd(), excludePatterns)) {
            console.log(`Skipping: ${oldPath} (excluded by patterns)`);
            continue;
        }
        if (entry.isDirectory() && options.recursive) {
            await collectRenamingMap(oldPath, options, excludePatterns);
            continue;
        }
        const { name, ext } = path_1.default.parse(entry.name);
        // 自动检测源文件格式
        const fromCase = (0, nameConverters_1.detectCase)(name);
        // 转换到目标格式
        const newName = (0, nameConverters_1.convertCase)(name, fromCase, options.to);
        // 添加前缀(如果有)
        const finalName = options.prefix ? `${options.prefix}${newName}` : newName;
        const newPath = path_1.default.join(dir, finalName + ext);
        // 检查是否已存在同名文件
        try {
            await promises_1.default.access(newPath);
            console.warn(`Warning: ${newPath} already exists, skipping...`);
            continue;
        }
        catch (_a) {
            // 文件不存在，可以安全重命名
            // 添加到重命名映射中
            renamedFiles.set(oldPath, newPath);
        }
    }
}
// 执行重命名操作
async function executeRenaming(options) {
    for (const [oldPath, newPath] of renamedFiles.entries()) {
        if (!options.dryRun) {
            await promises_1.default.rename(oldPath, newPath);
            console.log(`Renamed: ${oldPath} -> ${newPath}`);
        }
        else {
            console.log(`Will rename: ${oldPath} -> ${newPath}`);
        }
    }
}
