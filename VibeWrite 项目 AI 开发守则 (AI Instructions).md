Deep Write 项目 AI 开发守则 (AI Instructions)



0\. 总则：AI 工作模式 (General Principles)



模块化开发 (Modular Development)：严禁编写巨型文件。逻辑应拆分为独立的 Hook、Service 和 Component。每个文件应遵循“单一职责原则”。



先规划后代码 (Plan Before Code)：在执行任何复杂任务前，AI 必须先输出执行计划，说明涉及的文件修改及逻辑变动，待用户确认后再编写代码。



单元测试驱动 (Test-Informed)：关键逻辑（如：Prompt 拼接算法、滚动整合逻辑、状态过滤函数）必须编写对应的单元测试。



原子化修改 (Atomic Changes)：每次对话应专注于解决一个特定问题。避免在一次修改中混入多个不相关的功能点。



环境一致性：所有依赖必须在 package.json 中明确标注版本。代码中严禁硬编码 API 密钥或敏感环境信息。



1\. 项目核心愿景



Deep Write 是一款基于“风琴式交互”的结构化内容生成引擎。其核心逻辑在于通过“四折交互”达成共识，并利用“无记忆执行”和“滚动重写”技术产出高质量长文。



2\. 核心架构原则



单向状态流：所有数据必须存储在单一的事实来源 ConsensusState 中。



无记忆执行 (Stateless)：在调用 AI 生成正文时，严禁携带除当前节点必要背景和全局共识之外的任何历史对话。



模块化编排：逻辑层（Engine）、状态层（Store）与 UI 层（Components）必须严格分离。



模型中立：代码不应绑定特定的 SDK，需使用标准 OpenAI 兼容协议进行 API 调用。



3\. 技术栈规范



Frontend: React (Functional Components, Hooks)



Styling: Tailwind CSS (优先使用响应式类名)



State Management: Zustand 或 Context API (优先考虑轻量化)



Icons: Lucide-React



API 调用: 实现指数退避重试机制 (Exponential Backoff)



4\. 关键逻辑实现要求



4.1 第一折：原子化事实处理



解析素材后，必须将事实转化为对象数组：{ id: string, content: string, active: boolean }。



必须确保 UI 上的“置灰”状态与底层的 active 布尔值实时同步。



4.2 第二折：节点级素材



每个节点对象必须具备 localReferences 字段。



节点生成的 Prompt 必须是：GlobalConsensus + LocalReferences + NodeDescription。



4.3 第四折：滚动重写算法



严禁全量整合：必须实现 Node\[i] 处理时参考 Node\[i-1].lastChunk 的滚动逻辑。



整合过程需提供进度反馈，支持逐段渲染。



5\. 开发协作约束 (AI IDE 必读)



修改前检查：在修改任何核心 Engine 逻辑前，必须先读取 nexus\_agent\_prd.md 以确保符合产品意图。



禁止破坏性重构：严禁在未征得用户同意的情况下更改现有的数据结构（ConsensusState）。



错误处理：所有的 API 调用必须包含错误捕获，且严禁使用 alert()，必须通过 UI 提示组件展示错误。



代码注释：复杂算法（尤其是 Prompt 拼接和滚动重写逻辑）必须附带详尽的中文注释。



6\. UI/UX 约束



风琴交互：确保切换褶皱时的平滑动画。



响应式：必须适配从桌面到移动端的全尺寸显示。



视觉反馈：所有异步操作（AI 预测、文件解析）必须有明确的 Loading 状态。

