# AI Work OS

个人 AI 工作台：**本地或可部署的对话、多渠道、定时任务与技能扩展**，控制台与后端一体。

## 仓库说明

本仓库为 **AI Work OS** 的完整源码（Web 控制台 + Python 服务端）。开发与发布以本仓库为准。

## 运行要求

- **Python**：3.10 ≤ 版本 `< 3.14`
- **Node.js**：构建控制台时使用（参见 `console/package.json`）

## 快速上手

```bash
# 安装服务端依赖（建议在虚拟环境中）
pip install -e ".[full]"

# 命令行入口
copaw --help
```

控制台：

```bash
cd console
npm install
npm run dev
```

更详细的部署与配置见项目内文档与配置文件。

## 许可

源代码在符合根目录 **`LICENSE`** 条款的前提下使用。使用第三方依赖时亦需遵守各自的许可证。
