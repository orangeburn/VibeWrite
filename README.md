# VibeWrite - AI 驱动的长文写作助手 `v1.0`

简体中文 | [English](./README_EN.md) | [日本語](./README_JA.md) | [한국어](./README_KO.md)

基于 Next.js 和 Vercel AI SDK 构建的智能写作工具。VibeWrite 采用"共识优先"、"模块化生成"和"三栏式集成"理念，帮助用户高效创作高质量的长文内容。

## 🌟 核心理念

- **共识驱动 (Consensus-Driven)**: 在生成内容前，先建立全局事实和用户意图的"共识"，确保长文逻辑一致且无幻觉。
- **模块化生成 (Modular Production)**: 将长文拆分为独立的蓝图节点，支持并行生成与深度编辑。
- **三栏式集成界面**: 将配置、生产与审计集成在统一视野内，大幅提升创作效率。

## ✨ 功能特性

### 1. 三栏式高效工作流
- **左栏（配置面板）**: 实时解析写作意图，智能提取原子事实（Atomic Facts），动态生成配置表单。
- **中栏（工作画布）**: 蓝图框架规划，支持节点拖拽排序、锁定与手动微调。
- **右栏（预览与审计）**: 实时渲染预览，全局一致性审计，支持多格式导出。

### 2. 深度智能化功能
- **语义去重 (Semantic Deduplication)**: 智能识别并合并重复素材，确保内容精炼且丰富。
- **历史记录持久化**: 完整的创作版本管理，支持随时回溯至任何历史生成状态。
- **节点级素材注入**: 可为特定章节上传专属参考资料，实现更精准的局部控制。
- **并行异步生成**: 基于 Vercel AI SDK 实现多节点并行生成，速度与质量并存。

### 3. 全球化与定制化
- **多语言支持 (I18n)**: 已内置中、英、日、韩四国语言支持。
- **自定义指令 (Context Injection)**: 支持为单个节点注入高权重指令，精准引导 AI 语气与风格。
- **灵活的模型配置**: 支持 OpenAI (gpt-4o/gpt-4o-mini) 及 DeepSeek 等兼容 API。

## 🛠️ 技术栈

- **前端框架**: Next.js 15+ (App Router + Turbopack)
- **AI 引擎**: Vercel AI SDK
- **状态管理**: Zustand (带持久化插件)
- **UI 库**: React 19 + Radix UI + Tailwind CSS + Lucide Icons
- **表单与校验**: React Hook Form + Zod
- **国际化**: 自研轻量级 I18n 方案

## 🚀 快速开始

### 前置要求

- Node.js 18.17+
- OpenAI API Key 或兼容服务

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd VibeWrite
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 复制模板
   cp .env.local.example .env.local
   
   # 编辑 .env.local
   OPENAI_API_KEY=sk-your-key-here
   # 可选：配置自定义模型或 BASE_URL
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 📂 项目结构

```
VibeWrite/
├── app/                  # Next.js App Router 页面与 Server Actions
│   ├── actions/          # 后端 AI 逻辑封装 (setup, blueprint, production)
│   └── api/              # API 路由
├── components/           # React 组件
│   ├── ui/               # 基础 UI 组件 (Shadcn UI)
│   ├── three-column-layout.tsx  # 主布局
│   ├── scene-configuration.tsx   # 配置面板
│   ├── blueprint-editor.tsx     # 蓝图编辑器
│   └── audit-panel.tsx          # 审计与预览
├── lib/                  # 工具函数与配置
│   ├── i18n.ts           # 多语言配置
│   └── ai.ts             # AI 客户端初始化
├── store/                # Zustand 状态管理 (useVibeWriteStore)
└── public/               # 静态资源
```

## 📝 贡献指南

我们欢迎所有形式的贡献！无论是提交 Bug 反馈，还是提出新功能建议，甚至是直接推送 PR，您的帮助都能让 VibeWrite 变得更好。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 开源。
