# files-renamer

一个强大的文件批量重命名工具,支持多种命名格式的转换。

## 功能特点

-   支持多种常见命名格式之间的转换
-   可以递归处理子目录下的文件
-   支持添加文件名前缀
-   提供试运行模式,可以预览重命名效果
-   自动跳过已存在的同名文件

### 支持的命名格式

-   `snake`: 下划线分隔,全小写 (例如: two_words)
-   `screaming_snake`: 下划线分隔,全大写 (例如: TWO_WORDS)
-   `camel`: 驼峰式,首字母小写 (例如: twoWords)
-   `pascal`: 驼峰式,首字母大写 (例如: TwoWords)
-   `kebab`: 短横线分隔,全小写 (例如: two-words)
-   `dot`: 点号分隔,全小写 (例如: two.words)
-   `capital`: 空格分隔,单词首字母大写 (例如: Two Words)
-   `constant`: 下划线分隔,全大写 (例如: TWO_WORDS)
-   `no`: 空格分隔,全小写 (例如: two words)
-   `pascal_snake`: 下划线分隔,单词首字母大写 (例如: Two_Words)
-   `path`: 斜杠分隔,全小写 (例如: two/words)
-   `sentence`: 空格分隔,句子首字母大写 (例如: Two words)
-   `train`: 短横线分隔,单词首字母大写 (例如: Two-Words)

## 安装

### 使用 npm 全局安装

```bash
npm install -g files-renamer
```

### 本地开发

1. 克隆项目代码

```bash 
git clone https://github.com/yourusername/files-renamer.git
cd files-renamer
```

2. 安装依赖

```bash
npm install
```

3. 构建项目

```bash
npm run build
```

4. 链接到全局

```bash
npm link
```

## 开发调试

### 方式一: 使用 ts-node 直接运行

```bash
npm run dev
```

这会启动开发模式,代码变更时自动重启程序。

### 方式二: 使用 VSCode 调试

1. 打开项目文件夹
2. 按 F5 启动调试
3. 可以设置断点、单步调试、查看变量等

### 方式三: 全局链接调试

```bash
npm run build  # 先构建
npm link  # 全局链接
rename-files  # 运行命令测试
```

执行 `npm link` 后,可以在任意目录下使用 `rename-files` 命令来测试。

## 使用说明

在需要重命名文件的目录下运行:

```bash
rename-files
```

然后根据提示进行操作:

1. 选择源文件的命名格式
2. 选择目标命名格式
3. 确认是否递归处理子目录
4. 输入文件名前缀(可选)
5. 选择是否使用试运行模式

所有选项都可以通过方向键选择或直接输入。
