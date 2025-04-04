
---

## 如何安装 Nativefier 并打包网页成桌面应用

### ? 一、安装 Nativefier
Nativefier 是一个基于 Node.js 的工具，通过 npm 安装即可使用。

#### ?? 前提要求
在安装 Nativefier 之前，确保你的系统已安装以下软件：
- **Node.js**（安装后会自带 npm）
  
验证安装是否成功：
```bash
node -v   # 显示 Node.js 版本
npm -v    # 显示 npm 版本
```

#### ?? 安装 Nativefier（全局安装）
在终端（Windows 的 CMD/PowerShell，macOS/Linux 的 Terminal）中运行：
```bash
npm install -g nativefier
```
安装完成后，你可以在终端直接使用 `nativefier` 命令。

---

### ?? 二、打包在线网页
将在线网页打包成桌面应用的步骤很简单。

#### ?? 基本命令格式
```bash
nativefier "https://example.com" --name "YourAppName"
```

#### ? 示例
打包 StackEdit 在线 Markdown 编辑器：
```bash
nativefier "https://stackedit.io/app" --name "Markdown Online Editor"
```
- 作用：将 `https://stackedit.io/app` 打包成桌面应用。
- 应用名称：`Markdown Online Editor`。
- 输出：打包好的程序会保存在当前目录下的子文件夹中，例如 `./Markdown Online Editor-win32-x64/`。

#### ?? 可选增强参数
以下是一些常用的参数，可以根据需要添加到命令中：
| 参数                  | 说明                       |
|-----------------------|----------------------------|
| `--platform windows/mac/linux` | 指定目标平台（支持跨平台打包） |
| `--arch x64/arm64`    | 指定架构                  |
| `--icon icon.png`     | 自定义应用图标            |
| `--inject your.css`   | 注入自定义 CSS 样式        |
| `--disable-dev-tools` | 禁用开发者工具            |
| `--single-instance`   | 限制应用只能运行单一实例   |
| `--tray`              | 添加系统托盘支持          |

#### ?? 打包结果
- 默认输出路径：当前工作目录下的子文件夹，例如 `./Markdown Online Editor-win32-x64/`。
- 文件内容：包含可执行文件（如 `.exe` 或 `.app`），直接双击即可运行。

---

### ?? 三、打包离线 HTML 文件
如果你想打包本地的 HTML 文件（例如离线网页），需要稍微调整命令。

#### ?? 命令格式
```bash
nativefier --name "YourAppName" "file://绝对路径/到/yourfile.html"
```

#### ? 示例
假设你有一个本地的 `index.html` 文件位于 `C:/Projects/mywebsite/index.html`：
```bash
nativefier --name "My Offline App" "file://C:/Projects/mywebsite/index.html"
```
- 作用：将本地的 `index.html` 文件打包成桌面应用。
- 注意：
  - 路径必须是**绝对路径**。
  - Windows 路径使用正斜杠 `/`，并以 `file://` 开头。
  - 如果 HTML 文件引用了本地资源（如 CSS、JS、图片），确保这些资源路径在 HTML 中是相对路径，且与 `index.html` 在同一目录结构下。

#### ?? 增强参数
与在线网页打包类似，可以使用 `--icon`、`--platform` 等参数。例如：
```bash
nativefier --name "My Offline App" --icon "C:/Projects/mywebsite/icon.png" "file://C:/Projects/mywebsite/index.html"
```

---

### ?? 四、自动化脚本（可选）
如果你经常打包，可以用脚本简化操作。

#### Windows 示例（`.bat` 文件）
创建一个 `pack.bat` 文件：
```bat
@echo off
set URL=https://stackedit.io/app
set NAME=Markdown Online Editor
set ICON=C:/path/to/icon.png
nativefier "%URL%" --name "%NAME%" --icon "%ICON%"
pause
```
- 保存后双击运行即可打包。

#### macOS/Linux 示例（`.sh` 文件）
创建一个 `pack.sh` 文件：
```bash
#!/bin/bash
URL="https://stackedit.io/app"
NAME="Markdown Online Editor"
ICON="/path/to/icon.png"
nativefier "$URL" --name "$NAME" --icon "$ICON"
```
- 运行前赋予执行权限：`chmod +x pack.sh`，然后 `./pack.sh` 执行。

---

---
---
---

