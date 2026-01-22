# VibeWrite - AI-Driven Long-Form Writing Assistant `v1.0`

[简体中文](./README.md) | English | [日本語](./README_JA.md) | [한국어](./README_KO.md)

An intelligent writing tool built on Next.js and Vercel AI SDK. VibeWrite leverages "Consensus-Driven," "Modular Production," and "Three-Column Integration" concepts to help users create high-quality long-form content efficiently.

## 🌟 Core Concepts

- **Consensus-Driven**: Before generating content, establish a "consensus" on global facts and user intent to ensure consistency and eliminate hallucinations.
- **Modular Production**: Break down long articles into independent blueprint nodes, supporting parallel generation and deep editing.
- **Three-Column Integrated Interface**: Integrate configuration, production, and auditing into a single view for maximum creative efficiency.

## ✨ Features

### 1. Three-Column Efficient Workflow
- **Left Column (Config Panel)**: Real-time analysis of writing intent, intelligent extraction of Atomic Facts, and dynamic form generation.
- **Middle Column (Working Canvas)**: Blueprint framework planning with support for drag-and-drop reordering, locking, and manual adjustments.
- **Right Column (Preview & Audit)**: Real-time rendering, global consistency auditing, and multi-format export.

### 2. Advanced Intelligent Features
- **Semantic Deduplication**: Intelligently identify and merge duplicate materials for refined yet rich content.
- **History Persistence**: Complete version management for your creative work, allowing you to backtrack to any generated state.
- **Node-Level Material Injection**: Upload specific reference materials for individual chapters for precise local control.
- **Parallel Asynchronous Generation**: Multi-node parallel generation implemented via Vercel AI SDK for speed and quality.

### 3. Globalization & Customization
- **Multilingual Support (I18n)**: Built-in support for Chinese, English, Japanese, and Korean.
- **Custom Instructions (Context Injection)**: Inject high-weight instructions into individual nodes to precisely guide AI tone and style.
- **Flexible Model Configuration**: Supports OpenAI (gpt-4o/gpt-4o-mini) and DeepSeek-compatible APIs.

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15+ (App Router + Turbopack)
- **AI Engine**: Vercel AI SDK
- **State Management**: Zustand (with persistence middleware)
- **UI Library**: React 19 + Radix UI + Tailwind CSS + Lucide Icons
- **Form & Validation**: React Hook Form + Zod
- **Internationalization**: Custom lightweight I18n solution

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17+
- OpenAI API Key or compatible service

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd VibeWrite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy template
   cp .env.local.example .env.local
   
   # Edit .env.local
   OPENAI_API_KEY=sk-your-key-here
   # Optional: Configure custom models or BASE_URL
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```
VibeWrite/
├── app/                  # Next.js App Router pages and Server Actions
│   ├── actions/          # Backend AI logic (setup, blueprint, production)
│   └── api/              # API routes
├── components/           # React components
│   ├── ui/               # Base UI components (Shadcn UI)
│   ├── three-column-layout.tsx  # Main layout
│   ├── scene-configuration.tsx   # Config panel
│   ├── blueprint-editor.tsx     # Blueprint editor
│   └── audit-panel.tsx          # Audit and preview
├── lib/                  # Utilities and configs
│   ├── i18n.ts           # I18n configuration
│   └── ai.ts             # AI client initialization
├── store/                # Zustand store (useVibeWriteStore)
└── public/               # Static assets
```

## 📝 Contribution

All forms of contributions are welcome! From bug reports to feature suggestions and PRs, your help makes VibeWrite better.

## 📄 License

This project is licensed under the [MIT License](LICENSE).
