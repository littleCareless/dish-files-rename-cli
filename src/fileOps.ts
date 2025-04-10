import fs from "fs/promises";
import { existsSync, readFileSync, statSync, writeFileSync } from "fs";
import path from "path";
import micromatch from "micromatch";
import { CaseType, Options } from "./types";
import { convertCase, detectCase } from "./nameConverters";

// 记录重命名的文件映射: { 旧路径: 新路径 }
let renamedFiles: Map<string, string> = new Map();

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
async function readExcludePatterns(dir: string): Promise<string[]> {
  const excludeFiles = [".gitignore", ".ignore", ".npmignore"];
  let patterns: string[] = [];

  for (const excludeFile of excludeFiles) {
    const filePath = path.join(dir, excludeFile);
    if (existsSync(filePath)) {
      const content = readFileSync(filePath, "utf-8");
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
function shouldExclude(
  filePath: string,
  baseDir: string,
  patterns: string[]
): boolean {
  // 检查文件名是否在内置排除列表中
  const fileName = path.basename(filePath);
  if (BUILT_IN_EXCLUDE_FILES.includes(fileName)) {
    return true;
  }

  // 检查文件目录是否在内置排除列表中
  const dirName = path.basename(path.dirname(filePath));
  if (BUILT_IN_EXCLUDE_FILES.includes(dirName)) {
    return true;
  }

  if (patterns.length === 0) {
    return false;
  }

  // 获取相对于基础目录的路径
  const relativePath = path.relative(baseDir, filePath);

  // 使用micromatch检查路径是否匹配任何排除模式
  return micromatch.isMatch(relativePath, patterns);
}

// 更新文件中的 import 语句
async function updateImportStatements(
  dir: string,
  options: Options
): Promise<void> {
  if (!options.updateImports || options.dryRun) {
    return;
  }

  // 统计更新信息
  let totalFilesScanned = 0;
  let totalFilesUpdated = 0;
  let totalImportsUpdated = 0;
  let updatedImportDetails: {
    file: string;
    oldImport: string;
    newImport: string;
  }[] = [];

  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const filePath = path.join(dir, entry.name);

    // 如果是目录且需要递归处理
    if (entry.isDirectory() && options.recursive) {
      await updateImportStatements(filePath, options);
      continue;
    }

    // 扩展处理的文件类型
    const { ext } = path.parse(entry.name);
    const supportedExtensions = [
      // JavaScript/TypeScript 文件
      ".ts",
      ".js",
      ".tsx",
      ".jsx",
      ".mts",
      ".mjs",
      ".cjs",
      ".cts",
      // 框架特有文件类型
      ".vue",
      ".svelte",
      ".astro",
      // 样式文件
      ".css",
      ".scss",
      ".sass",
      ".less",
      ".styl",
      // HTML/XML/SVG
      ".html",
      ".xml",
      ".svg",
      // JSON/配置文件
      ".json",
      ".jsonc",
      ".json5",
      // 其他文件类型
      ".md",
    ];

    if (!supportedExtensions.includes(ext)) {
      continue;
    }

    totalFilesScanned++;

    // 读取文件内容
    let content: string;
    try {
      content = await fs.readFile(filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading file: ${filePath}`, error);
      continue;
    }

    let modified = false;
    let importsUpdated = 0;
    let fileImportDetails: { oldImport: string; newImport: string }[] = [];

    // 匹配各种 import 语句模式
    // 1. 普通导入: import { x } from './file';
    // 2. 默认导入: import x from './file';
    // 3. 命名空间导入: import * as x from './file';
    // 4. 类型导入: import type { x } from './file';
    // 5. 混合导入: import x, { y } from './file';
    // 6. CSS/SCSS导入: import './styles.css';
    const importRegex =
      /import\s+(?:(?:type\s+)?(?:(?:[^{},\s]+)\s*,\s*)?(?:(?:\*\s+as\s+[^{},\s]+)|(?:{[^{}]*?}))?\s*from\s*)?['"]([^'"]+)['"]/g;

    // 匹配动态导入: import('./file')
    const dynamicImportRegex = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

    // 匹配 require 语句: require('./file')
    const requireRegex = /require\(\s*['"]([^'"]+)['"]\s*\)/g;

    // 匹配导出语句: export * from './file'; export { x } from './file'; 等
    const exportRegex =
      /export\s+(?:(?:type\s+)?(?:(?:\*)|(?:{[^{}]*?}))\s+from\s+)['"]([^'"]+)['"]/g;

    // 匹配资源文件路径: const imgUrl = './assets/image.png' 或 const url = `./path/${var}`
    const resourcePathRegex = /(['"`])(\.\/?(?:\.\.\/)*(?:[^'"`;]*?))(['"`])/g;

    // 匹配 JSX/TSX/Vue/Svelte 中的资源引用: <img src="./images/logo.png" />
    const jsxPathRegex =
      /(?:src|href|url|path|source|background|poster)=(['"])(\.\/?(?:\.\.\/)*[^'"]*?)(['"])/g;

    // 匹配 CSS/SCSS 中的 url(): url('./images/bg.png')
    const cssUrlRegex =
      /url\(\s*(['"]?)(\.\/?(?:\.\.\/)*[^'")]*?)(['"]?)\s*\)/g;

    // 匹配 HTML 文件中的路径
    const htmlPathRegex =
      /(?:src|href|data-src|srcset)=(['"])(\.\/?(?:\.\.\/)*[^'"]*?)(['"])/g;

    // 匹配 JSON 配置文件中的路径: "outputDir": "./dist"
    const jsonPathRegex = /:\s*(['"])(\.\/?(?:\.\.\/)*[^'"]*?)(['"])/g;

    // 匹配类型引用文件: /// <reference path="./types.d.ts" />
    const typeRefRegex =
      /\/\/\/\s*<reference\s+path=(['"])(\.\/?(?:\.\.\/)*[^'"]*?)(['"])\s*\/>/g;

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

    // 更新导出语句
    newContent = newContent.replace(exportRegex, (match, exportPath) => {
      const result = updateImportPath(exportPath, filePath);
      if (result.updated) {
        modified = true;
        importsUpdated++;
        fileImportDetails.push({
          oldImport: exportPath,
          newImport: result.newPath,
        });
        return match.replace(exportPath, result.newPath);
      }
      return match;
    });

    // 更新资源文件路径
    newContent = newContent.replace(
      resourcePathRegex,
      (match, open, resourcePath, close) => {
        // 只处理相对路径
        if (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
          const result = updateImportPath(resourcePath, filePath);
          if (result.updated) {
            modified = true;
            importsUpdated++;
            fileImportDetails.push({
              oldImport: resourcePath,
              newImport: result.newPath,
            });
            return `${open}${result.newPath}${close}`;
          }
        }
        return match;
      }
    );

    // 更新 JSX/TSX/Vue/Svelte 中的资源引用路径
    newContent = newContent.replace(
      jsxPathRegex,
      (match, open, resourcePath, close) => {
        if (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
          const result = updateImportPath(resourcePath, filePath);
          if (result.updated) {
            modified = true;
            importsUpdated++;
            fileImportDetails.push({
              oldImport: resourcePath,
              newImport: result.newPath,
            });
            return match.replace(resourcePath, result.newPath);
          }
        }
        return match;
      }
    );

    // 更新 CSS/SCSS 中的 url() 路径
    newContent = newContent.replace(
      cssUrlRegex,
      (match, open, resourcePath, close) => {
        if (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
          const result = updateImportPath(resourcePath, filePath);
          if (result.updated) {
            modified = true;
            importsUpdated++;
            fileImportDetails.push({
              oldImport: resourcePath,
              newImport: result.newPath,
            });
            return `url(${open}${result.newPath}${close})`;
          }
        }
        return match;
      }
    );

    // 更新 HTML 文件中的路径
    if (ext === ".html" || ext === ".xml" || ext === ".svg") {
      newContent = newContent.replace(
        htmlPathRegex,
        (match, open, resourcePath, close) => {
          if (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
            const result = updateImportPath(resourcePath, filePath);
            if (result.updated) {
              modified = true;
              importsUpdated++;
              fileImportDetails.push({
                oldImport: resourcePath,
                newImport: result.newPath,
              });
              return match.replace(resourcePath, result.newPath);
            }
          }
          return match;
        }
      );
    }

    // 更新 JSON 配置文件中的路径
    if (ext === ".json" || ext === ".jsonc" || ext === ".json5") {
      newContent = newContent.replace(
        jsonPathRegex,
        (match, open, resourcePath, close) => {
          if (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
            const result = updateImportPath(resourcePath, filePath);
            if (result.updated) {
              modified = true;
              importsUpdated++;
              fileImportDetails.push({
                oldImport: resourcePath,
                newImport: result.newPath,
              });
              return match.replace(resourcePath, result.newPath);
            }
          }
          return match;
        }
      );
    }

    // 更新类型引用文件路径
    newContent = newContent.replace(
      typeRefRegex,
      (match, open, resourcePath, close) => {
        if (resourcePath.startsWith("./") || resourcePath.startsWith("../")) {
          const result = updateImportPath(resourcePath, filePath);
          if (result.updated) {
            modified = true;
            importsUpdated++;
            fileImportDetails.push({
              oldImport: resourcePath,
              newImport: result.newPath,
            });
            return match.replace(resourcePath, result.newPath);
          }
        }
        return match;
      }
    );

    // 如果文件被修改，写回文件
    if (modified) {
      try {
        writeFileSync(filePath, newContent, "utf-8");
        console.log(
          `Updated ${importsUpdated} imports/references in: ${filePath}`
        );

        // 记录详细的导入更新信息
        fileImportDetails.forEach((detail) => {
          console.log(`  - ${detail.oldImport} → ${detail.newImport}`);
          updatedImportDetails.push({
            file: filePath,
            oldImport: detail.oldImport,
            newImport: detail.newImport, // 修复：使用detail.newImport而不是detail.newPath
          });
        });

        totalFilesUpdated++;
        totalImportsUpdated += importsUpdated;
      } catch (error) {
        console.error(`Error writing file: ${filePath}`, error);
      }
    }
  }

  // 打印更新统计信息
  if (totalFilesUpdated > 0) {
    console.log(`\n--- 文件路径引用更新摘要 ---`);
    console.log(`文件扫描数量: ${totalFilesScanned}`);
    console.log(`文件更新数量: ${totalFilesUpdated}`);
    console.log(`更新的路径引用: ${totalImportsUpdated}`);

    // 输出按文件分组的详细更新日志
    if (updatedImportDetails.length > 0) {
      console.log(`\n详细更新日志:`);
      const fileGroups = new Map<
        string,
        { oldImport: string; newImport: string }[]
      >();

      updatedImportDetails.forEach((detail) => {
        if (!fileGroups.has(detail.file)) {
          fileGroups.set(detail.file, []);
        }
        fileGroups.get(detail.file)!.push({
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
function updateImportPath(
  importPath: string,
  filePath: string
): { updated: boolean; newPath: string } {
  // 处理相对路径导入
  if (importPath.startsWith("./") || importPath.startsWith("../")) {
    // 获取导入文件的绝对路径
    const importDir = path.dirname(filePath);
    const absoluteImportPath = path.resolve(importDir, importPath);

    // 检查导入的是否是一个目录
    let isDirectory = false;
    try {
      const stats =
        existsSync(absoluteImportPath) && statSync(absoluteImportPath);
      isDirectory = stats && stats.isDirectory();
    } catch {
      // 如果文件不存在，可能是导入了没有扩展名的文件
      isDirectory = false;
    }

    // 如果是目录，添加各种可能的索引文件
    let checkPaths = [];
    if (isDirectory) {
      // 添加各种可能的索引文件
      checkPaths.push(path.join(absoluteImportPath, "index.ts"));
      checkPaths.push(path.join(absoluteImportPath, "index.js"));
      checkPaths.push(path.join(absoluteImportPath, "index.tsx"));
      checkPaths.push(path.join(absoluteImportPath, "index.jsx"));
    } else {
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
          const newRelativePath = path
            .relative(importDir, newPath)
            .replace(/\\/g, "/"); // 确保在 Windows 上使用正斜杠

          // 如果不是以 ./ 或 ../ 开头，添加 ./
          const prefixedPath = newRelativePath.startsWith(".")
            ? newRelativePath
            : `./${newRelativePath}`;

          // 对于CSS/SCSS文件，保留扩展名，对于JS/TS文件移除扩展名
          const extension = path.extname(newPath).toLowerCase();
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

export async function renameFiles(
  dir: string,
  options: Options
): Promise<void> {
  // 重置重命名映射
  renamedFiles = new Map();

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

// 收集重命名映射
async function collectRenamingMap(
  dir: string,
  options: Options,
  excludePatterns: string[]
): Promise<void> {
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const oldPath = path.join(dir, entry.name);

    // 检查是否应该排除该路径
    if (
      options.respectExcludes &&
      shouldExclude(oldPath, process.cwd(), excludePatterns)
    ) {
      console.log(`Skipping: ${oldPath} (excluded by patterns)`);
      continue;
    }

    if (entry.isDirectory() && options.recursive) {
      await collectRenamingMap(oldPath, options, excludePatterns);
      continue;
    }

    const { name, ext } = path.parse(entry.name);

    // 自动检测源文件格式
    const fromCase = detectCase(name);
    // 转换到目标格式
    const newName = convertCase(name, fromCase, options.to);

    // 添加前缀(如果有)
    const finalName = options.prefix ? `${options.prefix}${newName}` : newName;

    const newPath = path.join(dir, finalName + ext);

    // 检查是否已存在同名文件
    try {
      await fs.access(newPath);
      console.warn(`Warning: ${newPath} already exists, skipping...`);
      continue;
    } catch {
      // 文件不存在，可以安全重命名
      // 添加到重命名映射中
      renamedFiles.set(oldPath, newPath);
    }
  }
}

// 执行重命名操作
async function executeRenaming(options: Options): Promise<void> {
  for (const [oldPath, newPath] of renamedFiles.entries()) {
    if (!options.dryRun) {
      await fs.rename(oldPath, newPath);
      console.log(`Renamed: ${oldPath} -> ${newPath}`);
    } else {
      console.log(`Will rename: ${oldPath} -> ${newPath}`);
    }
  }
}
