# 更新日志 (CHANGELOG)

本文档记录 dish-files-rename-cli 项目的所有重要变更。

## [1.0.0] - 2025-04-07

### 🔧 chore(deps): 更新依赖并调整项目配置

- **依赖更新**
  - 移除 commander 依赖
  - 添加 micromatch 依赖用于文件匹配
  - 添加开发依赖 @types/commander 和 @types/micromatch
- **配置调整**
  - 更新 package.json 中的项目名称和许可证信息
  - 优化 package-lock.json 的依赖树
- **功能完善**
  - 添加详细的 README.md 文档，说明工具功能和使用方法
  - 重构项目结构，增加配置文件和类型定义
  - 新增文件重命名和导入语句更新相关功能

### 💄 style(types): 优化类型定义格式并新增配置选项

- 调整 CaseType 枚举的缩进格式
- **新增配置选项**
  - respectExcludes 选项用于支持 .gitignore 规则
  - updateImports 选项用于控制 import 语句更新
  - preservedWords 选项用于配置不可分割词组
- 新增 PreservedWordsConfig 接口及配置文件常量定义

### ✨ feat(nameConverters): 添加保留词处理功能

- 新增保留词列表初始化功能
- 实现保留词加载和自定义配置支持
- 优化字符串分割算法，识别和保护保留词
- 重构 splitByPreservedWords 函数处理复杂的保留词场景
- 改进大写字母分割逻辑，考虑保留词边界
- 调整代码结构和命名，提高可读性
- 改进类型导入和错误处理机制

### ✨ feat(interactive): 添加保留词列表管理功能

- 增加保留词列表的加载和保存功能
- 实现保留词管理界面，支持添加、删除、编辑和重置操作
- 新增选项支持 .gitignore 排除规则和自动更新导入语句
- 添加保留词列表的初始化和使用机制
- 优化交互提示信息，提供更清晰的用户指引
- 增加默认保留词列表，包含常用技术缩写

### 🔧 refactor(fileOps): 重构文件操作模块并增强重命名功能

- 添加文件导入语句自动更新功能
- 增加内置排除文件和目录列表
- 新增支持排除模式(如.gitignore)的文件过滤
- 将重命名逻辑拆分为收集和执行两个阶段
- **新增功能**：支持多种导入语句格式的更新
  - 普通导入(import)
  - 动态导入(import())
  - require 语句
- 添加重命名操作的详细日志和统计信息

### ✨ feat(config): 添加配置文件管理功能

- 实现保留词配置文件的读写功能
- 添加默认保留词列表（常见缩写词和专有名词）
- 新增配置文件路径获取函数
- 实现配置文件的加载和保存方法
- 支持错误处理和日志输出

### ✨ feat(cli): 添加文件重命名的高级选项

- 新增 respectExcludes 选项用于支持 .gitignore 等排除规则
- 新增 updateImports 选项用于自动更新文件中的引用路径
- 优化代码缩进格式，提升可读性
