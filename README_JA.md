# VibeWrite - AI駆動の長文執筆アシスタント `v1.0`

[简体中文](./README.md) | [English](./README_EN.md) | 日本語 | [한국어](./README_KO.md)

Next.jsとVercel AI SDKで構築されたインテリジェントな執筆ツールです。VibeWriteは、「コンセンサス優先」、「モジュール化生成」、「三列統合」のコンセプトを採用し、ユーザーが高品質な長文コンテンツを効率的に作成できるように支援します。

## 🌟 核心コンセプト

- **コンセンサス駆動 (Consensus-Driven)**: コンテンツを生成する前に、グローバルな事実とユーザーの意図の「コンセンサス」を確立し、一貫性を確保してハルシネーションを排除します。
- **モジュール化生成 (Modular Production)**: 長文を独立したブループリントノードに分解し、並列生成と詳細な編集をサポートします。
- **三列統合インターフェース**: 設定、構成、監査を単一のビューに統合し、創作効率を大幅に向上させます。

## ✨ 機能特性

### 1. 三列の効率的なワークフロー
- **左列（設定パネル）**: 執筆意図をリアルタイムで解析し、原子事実（Atomic Facts）をインテリジェントに抽出。動的にフォームを生成します。
- **中列（ワークキャンバス）**: ドラッグ＆ドロップによる並べ替え、ロック、手動調整をサポートするブループリントフレームワークの計画。
- **右列（プレビューと監査）**: リアルタイムレンダリング、グローバルな一貫性監査、マルチフォーマットエクスポートをサポートします。

### 2. 高度なインテリジェント機能
- **セマンティック重複排除 (Semantic Deduplication)**: 重複する素材をインテリジェントに認識してマージし、洗練された豊かなコンテンツを確保します。
- **履歴の永続化**: 創作活動の完全なバージョン管理。生成されたあらゆる状態にいつでも戻ることができます。
- **ノードレベルの素材注入**: 特定の章に対して専用の参考資料をアップロードし、精度の高いローカル制御を実現します。
- **並列非同期生成**: Vercel AI SDKの実装により、速度と品質を両立させた多ノード並列生成を実現。

### 3. グローバル化とカスタマイズ
- **多言語サポート (I18n)**: 中国語、英語、日本語、韓国語の公式サポートを内蔵。
- **カスタム指示 (Context Injection)**: 個別のノードに高ウェイトの指示を注入し、AIのトーンやスタイルを正確にガイドします。
- **柔軟なモデル設定**: OpenAI (gpt-4o/gpt-4o-mini) および DeepSeek 互換 API をサポート。

## 🛠️ 技術スタック

- **フロントエンドフレームワーク**: Next.js 15+ (App Router + Turbopack)
- **AIエンジン**: Vercel AI SDK
- **状態管理**: Zustand (永続化ミドルウェア付き)
- **UIライブラリ**: React 19 + Radix UI + Tailwind CSS + Lucide Icons
- **フォームと検証**: React Hook Form + Zod
- **国際化**: 自作の軽量I18nソリューション

## 🚀 クイックスタート

### 前置要件

- Node.js 18.17+
- OpenAI API キーまたは互換サービス

### インストール手順

1. **リポジトリをクローンする**
   ```bash
   git clone <your-repo-url>
   cd VibeWrite
   ```

2. **依存関係をインストールする**
   ```bash
   npm install
   ```

3. **環境変数を設定する**
   ```bash
   # テンプレートをコピー
   cp .env.local.example .env.local
   
   # .env.localを編集
   OPENAI_API_KEY=sk-your-key-here
   # オプション：カスタムモデルまたはBASE_URLの設定
   ```

4. **開発サーバーを起動する**
   ```bash
   npm run dev
   ```

## 📂 プロジェクト構造

```
VibeWrite/
├── app/                  # Next.js App Router ページと Server Actions
│   ├── actions/          # バックエンドAIロジック (setup, blueprint, production)
│   └── api/              # APIルート
├── components/           # Reactコンポーネント
│   ├── ui/               # 基礎UIコンポーネント (Shadcn UI)
│   ├── three-column-layout.tsx  # メインレイアウト
│   ├── scene-configuration.tsx   # 設定パネル
│   ├── blueprint-editor.tsx     # ブループリントエディタ
│   └── audit-panel.tsx          # 監査とプレビュー
├── lib/                  # ユーティリティと構成
│   ├── i18n.ts           # 多言語設定
│   └── ai.ts             # AIクライアント初期化
├── store/                # Zustand ストア (useVibeWriteStore)
└── public/               # 静的アセット
```

## 📝 貢献

あらゆる形式の貢献を歓迎します！バグ報告から機能の提案、PRの提出まで、あなたの協力がVibeWriteをより良くします。

## 📄 ライセンス

このプロジェクトは [MIT ライセンス](LICENSE) の下でライセンスされています。
