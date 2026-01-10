# VibeWrite - AI 驱动的长文写作助手

基于 Next.js 和 Vercel AI SDK 构建的智能写作工具,采用"共识优先"和"模块化生成"理念,帮助用户高效创作高质量长文内容。

## 功能特性

### 四大核心模块

1. **场景自适应配置 (Fold 1)**
   - 智能解析用户意图和上传素材
   - 提取原子事实 (Atomic Facts)
   - 动态生成配置表单

2. **蓝图框架规划 (Fold 2)**
   - AI 自动生成文章结构
   - 支持节点级别的素材注入
   - 可锁定和手动调整节点

3. **模块化生产 (Fold 3)**
   - 无状态并行内容生成
   - 基于全局共识和局部事实
   - 避免幻觉和误差累积

4. **序列整合与审计 (Fold 4)**
   - 滚动窗口模式平滑衔接
   - 全局一致性审计
   - 多格式导出 (Markdown/TXT/PDF)

## 技术栈

- **框架**: Next.js 16 (App Router + Turbopack)
- **AI SDK**: Vercel AI SDK + OpenAI
- **UI**: React 19 + Radix UI + Tailwind CSS
- **表单**: React Hook Form + Zod
- **类型**: TypeScript

## 本地开发

### 前置要求

- Node.js 18+
- OpenAI API Key 或兼容服务 (如 DeepSeek)

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
   # 复制环境变量模板
   cp .env.local.example .env.local
   
   # 编辑 .env.local 并填入您的 API Key
   # OPENAI_API_KEY=sk-your-key-here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

### 步骤

1. **推送代码到 GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **在 Vercel 导入项目**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "Import Project"
   - 选择您的 GitHub 仓库

3. **配置环境变量**
   
   在 Vercel 项目设置中添加:
   - `OPENAI_API_KEY`: 您的 OpenAI API Key
   - `OPENAI_BASE_URL` (可选): 如使用 DeepSeek 等兼容服务

4. **部署**
   
   Vercel 会自动构建和部署

## 环境变量说明

| 变量名 | 必需 | 默认值 | 说明 |
|--------|------|--------|------|
| `OPENAI_API_KEY` | ✅ | - | OpenAI API 密钥 |
| `OPENAI_PLANNING_MODEL` | ❌ | `gpt-4o` | 规划模型 (意图分析、蓝图生成、审计) |
| `OPENAI_WRITING_MODEL` | ❌ | `gpt-4o-mini` | 写作模型 (内容生成) |
| `OPENAI_BASE_URL` | ❌ | - | 自定义 API 端点 (用于兼容服务) |

### 获取 API Key

- **OpenAI**: https://platform.openai.com/api-keys
- **DeepSeek**: https://platform.deepseek.com

### 模型选择建议

**OpenAI 用户**:
- Planning Model: `gpt-4o` (推荐) 或 `gpt-4-turbo`
- Writing Model: `gpt-4o-mini` (经济) 或 `gpt-4o` (质量优先)

**DeepSeek 用户**:
- 两个模型都使用: `deepseek-chat`
- 需要设置 `OPENAI_BASE_URL=https://api.deepseek.com`

## 项目结构

```
VibeWrite/
├── app/
│   ├── actions/          # Server Actions
│   │   ├── setup.ts      # Fold 1: 意图分析
│   │   ├── blueprint.ts  # Fold 2: 蓝图生成
│   │   └── production.ts # Fold 3 & 4: 内容生成与审计
│   ├── layout.tsx
│   └── page.tsx
├── components/           # React 组件
│   ├── scene-configuration.tsx
│   ├── blueprint-framework.tsx
│   ├── modular-production.tsx
│   └── integration-audit.tsx
├── lib/
│   ├── ai.ts            # AI SDK 配置
│   ├── parser.ts        # 文本处理工具
│   └── types.ts         # TypeScript 类型定义
└── .env.local.example   # 环境变量模板
```

## 使用流程

1. **场景配置**
   - 输入写作意图
   - (可选) 上传参考文件
   - 点击"解析写作意图"
   - 选择启用的事实
   - 填写动态配置表单

2. **蓝图规划**
   - 点击"生成蓝图"查看 AI 生成的文章结构
   - 调整节点顺序、标题和描述
   - (可选) 为特定节点上传专属素材

3. **模块生产**
   - 点击"开始生成"
   - 等待 AI 逐节点生成内容
   - 可对单个节点重新生成

4. **整合审计**
   - 点击"开始处理"
   - 查看整合后的完整文章
   - 查看审计报告
   - 导出为 Markdown/TXT/PDF

## 开发命令

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start

# 代码检查
npm run lint
```

## 许可证

MIT

## 贡献

欢迎提交 Issue 和 Pull Request!
