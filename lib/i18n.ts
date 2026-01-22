import { useVibeWriteStore } from '@/store/useVibeWriteStore'

export type Language = 'zh' | 'en' | 'ja' | 'ko'

// Flattened translation keys
type TranslationKey =
    | 'appName'
    | 'title'
    | 'description'
    | 'networkStatus.online'
    | 'networkStatus.offline'
    | 'currentLanguage'
    | 'autoDetect'
    | 'act1Label'
    | 'act2Label'
    | 'currentChapter'
    | 'generate'
    | 'save'
    | 'cancel'
    | 'edit'
    | 'delete'
    | 'confirm'
    | 'back'
    | 'next'
    | 'loading'
    | 'error'
    | 'success'
    | 'warning'
    | 'generating'
    | 'completed'
    | 'failed'
    | 'regenerated'
    | 'generationFailed'
    | 'autoCorrection'
    | 'toastGenerated'
    | 'toastFailed'
    | 'toastRegenerated'
    | 'toastGenerationFailed'
    | 'placeholderSearch'
    | 'placeholderInput'
    | 'placeholderSelect'
    | 'integrationAuditTitle'
    | 'integrationAuditDescription'
    | 'integrationStartTitle'
    | 'integrationStartDescription'
    | 'integrationButton'
    | 'integrationButtonProcessing'
    | 'contentTab'
    | 'auditTab'
    | 'finalContentTitle'
    | 'finalContentDescription'
    | 'regenerateIntegration'
    | 'regenerateIntegrationProcessing'
    | 'exportMarkdown'
    | 'exportTxt'
    | 'exportDocx'
    | 'generatedArticleTitle'
    | 'noTitleGenerated'
    | 'regenerateTitleButton'
    | 'auditReportTitle'
    | 'auditReportDescription'
    | 'auditPassed'
    | 'auditSuggestion'
    | 'auditRisk'
    | 'auditAnomaly'
    | 'auditNoDescription'
    | 'auditUnstructured'
    | 'backButton'
    | 'createNewProject'
    | 'fullIntegration'
    | 'integrationInProgress'
    | 'unnamedArticle'
    | 'originalContent'
    | 'correctedTo'
    | 'reason'
    | 'blueprintGenerationSuccess'
    | 'blueprintGenerationFailed'
    | 'contentGenerationFailedRetry'
    | 'allContentGenerated'
    | 'contentRegenerated'
    | 'contentRegenerationFailed'
    | 'smartGenerationTitle'
    | 'smartGenerationDescription'
    | 'lockedNodesCount'
    | 'generatingInProgress'
    | 'regenerateContent'
    | 'generateBlueprintButton'
    | 'generationProgressTitle'
    | 'parallelGenerationStatus'
    | 'materialParsingResult'
    | 'parseIntentAndMaterials'
    | 'parseIntentOnly'
    | 'parseMaterialsOnly'
    | 'parsingInProgress'
    | 'reparseMaterials'
    | 'factSelectionTitle'
    | 'factSelectionDescription'
    | 'parsingCompleteNoFacts'
    | 'partialParsingFailed'
    | 'materialParsingSuccess'
    | 'parsingFailed'
    | 'allFactsCleared'
    | 'parsingButtonText'
    | 'sidebar.expand'
    | 'sidebar.collapse'
    | 'column1.title'
    | 'column1.show'
    | 'column1.hide'
    | 'column1.flowIndicator'
    | 'column2.blueprintTitle'
    | 'column2.auditTitle'
    | 'column2.blueprintTab'
    | 'column2.auditTab'
    | 'column2.nextToAudit'
    | 'column2.backToBlueprint'
    | 'config.intentTitle'
    | 'config.intentDescription'
    | 'config.intentPlaceholder'
    | 'config.materialTitle'
    | 'config.materialDescription'
    | 'config.urlPlaceholder'
    | 'config.addButton'
    | 'config.uploadButton'
    | 'editor.emptyTitle'
    | 'editor.emptyDescription'
    | 'editor.constructionComplete'
    | 'editor.nodesGenerated'
    | 'editor.readyForAudit'
    | 'editor.mergeAndAuditButton'
    | 'audit.statusPassed'
    | 'audit.statusSuggestion'
    | 'audit.statusRisk'
    | 'audit.statusAnomaly'
    | 'audit.noResults'
    | 'audit.disclaimer'
    | 'audit.title'
    | 'audit.subtitle'
    | 'audit.previewTitle'
    | 'audit.previewSubtitle'
    | 'audit.statusRefining'
    | 'audit.statusAuditing'
    | 'audit.statusIntegrated'
    | 'audit.runButton'
    | 'audit.auditingButton'
    | 'audit.passedCount'
    | 'audit.toastSuccess'
    | 'audit.toastFailed'
    | 'audit.toastError'
    | 'audit.defaultPreview'
    | 'node.status.pending'
    | 'node.status.generating'
    | 'node.status.completed'
    | 'node.status.error'
    | 'node.unnamed'
    | 'node.lock'
    | 'node.unlock'
    | 'node.titleLabel'
    | 'node.titlePlaceholder'
    | 'node.descLabel'
    | 'node.descPlaceholder'
    | 'node.previewLabel'
    | 'node.noContent'
    | 'node.generatingContent'
    | 'node.waitingContent'
    | 'node.regenerate'
    | 'node.deepEdit'
    | 'sidebar.deepEditTitle'
    | 'sidebar.customInstructions'
    | 'sidebar.customInstructionsDesc'
    | 'sidebar.customInstructionsPlaceholder'
    | 'sidebar.customInstructionsTip'
    | 'sidebar.nodeMaterials'
    | 'sidebar.nodeMaterialsDesc'
    | 'sidebar.parsing'
    | 'sidebar.reparse'
    | 'sidebar.parse'
    | 'sidebar.extractedFacts'
    | 'sidebar.regenerateContent'
    | 'sidebar.finishEdit'
    | 'toast.exportSuccess'
    | 'toast.exportFailed'
    | 'toast.intentRequired'
    | 'toast.intentMaterialRequired'
    | 'toast.blueprintError'
    | 'toast.exportedMarkdown'
    | 'toast.exportedDocx'
    | 'toast.exportedTxt'

const translations: Record<Language, Record<TranslationKey, string>> = {
    zh: {
        appName: 'VibeWrite',
        title: 'VibeWrite - AI 协作写作工具',
        description: '基于共识驱动与模块化生成的 AI 协作工具',

        // Header
        'networkStatus.online': '当前：联网',
        'networkStatus.offline': '当前：离线',
        currentLanguage: '当前语言: {language}',
        autoDetect: '根据IP自动检测',

        // Layout labels
        act1Label: '配置创作情境',
        act2Label: '智能生成工作流',

        // Sidebar
        currentChapter: '当前章节',

        // UI Components
        generate: '生成',
        save: '保存',
        cancel: '取消',
        edit: '编辑',
        delete: '删除',
        confirm: '确认',
        back: '返回',
        next: '下一步',
        loading: '加载中...',
        error: '出错',
        success: '成功',
        warning: '警告',

        // Status messages
        generating: '生成中...',
        completed: '已完成',
        failed: '失败',
        regenerated: '已重新生成',
        generationFailed: '生成失败',

        // Audit messages
        autoCorrection: '自动修复：事实冲突已修正',

        // Toast messages
        toastGenerated: '生成成功',
        toastFailed: '生成失败，请重试',
        toastRegenerated: '已重新生成',
        toastGenerationFailed: '生成失败',

        // Placeholders
        placeholderSearch: '搜索...',
        placeholderInput: '请输入...',
        placeholderSelect: '请选择...',

        // Integration Audit
        integrationAuditTitle: '整合与审计',
        integrationAuditDescription: '将所有章节内容进行智能整合，并进行事实准确性校验',
        integrationStartTitle: '开始整合与审计',
        integrationStartDescription: '系统将采用智能全文整合模式，并根据素材进行事实准确性校验与自动修正',
        integrationButton: '全文整合',
        integrationButtonProcessing: '整合中...',
        contentTab: '整合内容',
        auditTab: '审计报告',
        finalContentTitle: '最终内容',
        finalContentDescription: '所有章节已完成整合，可导出多种格式',
        regenerateIntegration: '重新整合',
        regenerateIntegrationProcessing: '重新整合中...',
        exportMarkdown: 'Markdown',
        exportTxt: 'TXT',
        exportDocx: 'DOCX',
        generatedArticleTitle: '生成的文章标题',
        noTitleGenerated: '未生成标题',
        regenerateTitleButton: '重新生成标题',
        auditReportTitle: '审计报告',
        auditReportDescription: '全局一致性、逻辑性与事实准确性检查',
        auditPassed: '通过',
        auditSuggestion: '建议',
        auditRisk: '风险',
        auditAnomaly: '审计异常',
        auditNoDescription: '未提供详细说明',
        auditUnstructured: '审计结果未结构化',
        backButton: '上一步',
        createNewProject: '创建新项目',
        fullIntegration: '全文整合',
        integrationInProgress: '整合中...',
        unnamedArticle: '未命名文章',
        originalContent: '原内容',
        correctedTo: '修正为',
        reason: '理由',

        // Blueprint Framework
        blueprintGenerationSuccess: '框架生成成功，开始生成内容...',
        blueprintGenerationFailed: '框架生成失败',
        contentGenerationFailedRetry: '生成失败，请重试',
        allContentGenerated: '所有内容生成完成',
        contentRegenerated: '{title} 已重新生成',
        contentRegenerationFailed: '{title} 重新生成失败',
        smartGenerationTitle: '智能生成',
        smartGenerationDescription: '基于您的写作意图和全局背景，模块化生成内容',
        lockedNodesCount: '已锁定 {count} 个节点，重新生成时将保留',
        generatingInProgress: '生成中...',
        regenerateContent: '重新生成',
        generateBlueprintButton: '生成蓝图',
        generationProgressTitle: '生成进度',
        parallelGenerationStatus: '正在通过子代理并行生成...',
        materialParsingResult: '解析结果提取',
        parseIntentAndMaterials: '解析写作意图和素材',
        parseIntentOnly: '解析写作意图',
        parseMaterialsOnly: '解析素材',
        parsingInProgress: '正在解析中...',
        reparseMaterials: '重新解析素材',
        factSelectionTitle: '解析的主题点',
        factSelectionDescription: '从写作意图和素材中解析的主题点，点击切换启用状态',
        parsingCompleteNoFacts: '解析结束，但未提取到有效事实',
        partialParsingFailed: '部分素材解析失败',
        materialParsingSuccess: '素材解析成功',
        parsingFailed: '解析失败',
        allFactsCleared: '已清除所有解析的事实',
        parsingButtonText: '{intent}{materials}',
        'sidebar.expand': '展开侧边栏',
        'sidebar.collapse': '收起侧边栏',
        'column1.title': '配置面板',
        'column1.show': '显示配置面板',
        'column1.hide': '隐藏配置面板',
        'column1.flowIndicator': '流向生产画布',
        'column2.blueprintTitle': '编辑',
        'column2.auditTitle': '审计面板',
        'column2.blueprintTab': '编辑',
        'column2.auditTab': '审计',
        'column2.nextToAudit': '下一步：审计',
        'column2.backToBlueprint': '返回蓝图',

        // Config Panel
        'config.intentTitle': '写作意图',
        'config.intentDescription': '请描述您想要创建的内容类型和目标',
        'config.intentPlaceholder': '例如:撰写一篇关于公司产品的市场分析报告,目标受众是潜在投资者...',
        'config.materialTitle': '参考素材(可选)',
        'config.materialDescription': '上传文件或添加链接作为参考素材',
        'config.urlPlaceholder': '输入 URL...',
        'config.addButton': '添加',
        'config.uploadButton': '上传文件',

        // Blueprint Editor
        'editor.emptyTitle': '蓝图节点为空',
        'editor.emptyDescription': '请在左侧配置面板中设置写作意图和素材，然后解析生成蓝图。',
        'editor.constructionComplete': '内容构建完成：',
        'editor.nodesGenerated': '{count} 个节点已全部生成',
        'editor.readyForAudit': '准备好整合审计',
        'editor.mergeAndAuditButton': '合并全文并审计',

        // Audit Panel
        'audit.statusPassed': '通过',
        'audit.statusSuggestion': '建议',
        'audit.statusRisk': '风险',
        'audit.statusAnomaly': '异常',
        'audit.noResults': '暂无审计结果，请点击上方按钮运行审计',
        'audit.disclaimer': '审计报告基于AI分析生成，仅供参考。',
        'audit.title': '审计报告',
        'audit.subtitle': '全局一致性与事实核查',
        'audit.previewTitle': '全文预览',
        'audit.previewSubtitle': '整合后的内容预览',
        'audit.statusRefining': 'AI 重写中...',
        'audit.statusAuditing': '正在审计...',
        'audit.statusIntegrated': '已整合',
        'audit.runButton': '运行审计',
        'audit.auditingButton': '审计中...',
        'audit.passedCount': '个通过',
        'audit.toastSuccess': '审计完成',
        'audit.toastFailed': '审计失败',
        'audit.toastError': '审计过程中发生错误',
        'audit.defaultPreview': '# 这里是整合后的长文预览\n\n本文档由VibeWrite智能生成，结合了您的写作意图和所有素材。\n\n## 章节一：引言\n\n这是自动生成的内容示例。\n\n## 章节二：主体内容\n\n更多详细内容将在此展示。\n\n## 章节三：结论\n\n总结全文观点。\n',

        // Node
        'node.status.pending': '待生成',
        'node.status.generating': '生成中',
        'node.status.completed': '已完成',
        'node.status.error': '生成失败',
        'node.unnamed': '未命名节点',
        'node.lock': '锁定节点',
        'node.unlock': '解锁节点',
        'node.titleLabel': '节点标题',
        'node.titlePlaceholder': '输入章节标题...',
        'node.descLabel': '节点描述',
        'node.descPlaceholder': '描述本节点的写作重点和关键内容...',
        'node.previewLabel': '生成内容预览',
        'node.noContent': '暂无内容',
        'node.generatingContent': '正在生成内容...',
        'node.waitingContent': '等待生成...',
        'node.regenerate': '重新生成',
        'node.deepEdit': '深度编辑',

        // Sidebar
        'sidebar.deepEditTitle': '章节深度编辑',
        'sidebar.customInstructions': '自定义生成指令',
        'sidebar.customInstructionsDesc': '输入特定指令，例如：\'强调技术创新\' 或 \'改为更通俗的表述\'',
        'sidebar.customInstructionsPlaceholder': '在此输入您的个性化要求...',
        'sidebar.customInstructionsTip': '* 指令将在生成时作为高权重背景注入 AI',
        'sidebar.nodeMaterials': '节点级素材',
        'sidebar.nodeMaterialsDesc': '为该节点单独上传参考资料，仅在此章节生成时使用。这些素材将与全局素材共同发挥作用。',
        'sidebar.parsing': '解析中...',
        'sidebar.reparse': '重新解析节点素材',
        'sidebar.parse': '解析节点素材',
        'sidebar.extractedFacts': '已提取知识点',
        'sidebar.regenerateContent': '重新生成内容',
        'sidebar.finishEdit': '完成编辑',

        // Toasts
        'toast.exportSuccess': '导出成功',
        'toast.exportFailed': '导出失败',
        'toast.intentRequired': '请输入写作意图',
        'toast.intentMaterialRequired': '写作意图或参考素材至少需要填写一项',
        'toast.blueprintError': '蓝图生成过程中发生错误',
        'toast.exportedMarkdown': '已导出为 Markdown',
        'toast.exportedDocx': '已导出为 DOCX',
        'toast.exportedTxt': '已导出为 TXT',
    },
    en: {
        appName: 'VibeWrite',
        title: 'VibeWrite - AI Collaborative Writing Tool',
        description: 'AI collaborative tool based on consensus-driven and modular generation',

        // Header
        'networkStatus.online': 'Online',
        'networkStatus.offline': 'Offline',
        currentLanguage: 'Current language: {language}',
        autoDetect: 'Auto-detect by IP',

        // Layout labels
        act1Label: 'Configure Writing Context',
        act2Label: 'Smart Generation Workflow',

        // Sidebar
        currentChapter: 'Current Chapter',

        // UI Components
        generate: 'Generate',
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',

        // Status messages
        generating: 'Generating...',
        completed: 'Completed',
        failed: 'Failed',
        regenerated: 'Regenerated',
        generationFailed: 'Generation failed',

        // Audit messages
        autoCorrection: 'Auto-correction: Fact conflict resolved',

        // Toast messages
        toastGenerated: 'Generated successfully',
        toastFailed: 'Generation failed, please try again',
        toastRegenerated: 'Regenerated',
        toastGenerationFailed: 'Generation failed',

        // Placeholders
        placeholderSearch: 'Search...',
        placeholderInput: 'Please enter...',
        placeholderSelect: 'Please select...',

        // Integration Audit
        integrationAuditTitle: 'Integration and Audit',
        integrationAuditDescription: 'Intelligently integrate all chapter content and verify factual accuracy',
        integrationStartTitle: 'Start Integration and Audit',
        integrationStartDescription: 'System will use intelligent full-text integration mode and perform factual accuracy verification and auto-correction based on materials',
        integrationButton: 'Full Integration',
        integrationButtonProcessing: 'Integrating...',
        contentTab: 'Integrated Content',
        auditTab: 'Audit Report',
        finalContentTitle: 'Final Content',
        finalContentDescription: 'All chapters have been integrated and can be exported in multiple formats',
        regenerateIntegration: 'Reintegrate',
        regenerateIntegrationProcessing: 'Reintegrating...',
        exportMarkdown: 'Markdown',
        exportTxt: 'TXT',
        exportDocx: 'DOCX',
        generatedArticleTitle: 'Generated Article Title',
        noTitleGenerated: 'No title generated',
        regenerateTitleButton: 'Regenerate Title',
        auditReportTitle: 'Audit Report',
        auditReportDescription: 'Global consistency, logicality, and factual accuracy check',
        auditPassed: 'Passed',
        auditSuggestion: 'Suggestion',
        auditRisk: 'Risk',
        auditAnomaly: 'Audit anomaly',
        auditNoDescription: 'No description provided',
        auditUnstructured: 'Audit result not structured',
        backButton: 'Back',
        createNewProject: 'Create New Project',
        fullIntegration: 'Full Integration',
        integrationInProgress: 'Integrating...',
        unnamedArticle: 'Untitled Article',
        originalContent: 'Original content',
        correctedTo: 'Corrected to',
        reason: 'Reason',

        // Blueprint Framework
        blueprintGenerationSuccess: 'Blueprint generated successfully, starting content generation...',
        blueprintGenerationFailed: 'Blueprint generation failed',
        contentGenerationFailedRetry: 'Generation failed, please retry',
        allContentGenerated: 'All content generated',
        contentRegenerated: '{title} regenerated',
        contentRegenerationFailed: '{title} regeneration failed',
        smartGenerationTitle: 'Smart Generation',
        smartGenerationDescription: 'Generate content modularly based on your writing intent and global context',
        lockedNodesCount: '{count} nodes locked, will be preserved during regeneration',
        generatingInProgress: 'Generating...',
        regenerateContent: 'Regenerate',
        generateBlueprintButton: 'Generate Blueprint',
        generationProgressTitle: 'Generation Progress',
        parallelGenerationStatus: 'Parallel generation via sub-agents in progress...',
        materialParsingResult: 'Parsing Result Extraction',
        parseIntentAndMaterials: 'Parse Writing Intent and Materials',
        parseIntentOnly: 'Parse Writing Intent',
        parseMaterialsOnly: 'Parse Materials',
        parsingInProgress: 'Parsing in progress...',
        reparseMaterials: 'Reparse Materials',
        factSelectionTitle: 'Parsed Themes',
        factSelectionDescription: 'Themes parsed from writing intent and materials, click to toggle enabled state',
        parsingCompleteNoFacts: 'Parsing complete but no valid facts extracted',
        partialParsingFailed: 'Partial material parsing failed',
        materialParsingSuccess: 'Material parsing successful',
        parsingFailed: 'Parsing failed',
        allFactsCleared: 'All parsed facts cleared',
        parsingButtonText: '{intent}{materials}',
        'sidebar.expand': 'Expand sidebar',
        'sidebar.collapse': 'Collapse sidebar',
        'column1.title': 'Configuration Panel',
        'column1.show': 'Show configuration panel',
        'column1.hide': 'Hide configuration panel',
        'column1.flowIndicator': 'Flow to production canvas',
        'column2.blueprintTitle': 'Edit',
        'column2.auditTitle': 'Audit Panel',
        'column2.blueprintTab': 'Edit',
        'column2.auditTab': 'Audit',
        'column2.nextToAudit': 'Next: Audit',
        'column2.backToBlueprint': 'Back to Blueprint',

        // Config Panel
        'config.intentTitle': 'Writing Intent',
        'config.intentDescription': 'Describe the type of content and goal you want to create',
        'config.intentPlaceholder': 'e.g., write a market analysis report about company products for potential investors...',
        'config.materialTitle': 'Reference Materials (Optional)',
        'config.materialDescription': 'Upload files or add links as reference materials',
        'config.urlPlaceholder': 'Enter URL...',
        'config.addButton': 'Add',
        'config.uploadButton': 'Upload Files',

        // Blueprint Editor
        'editor.emptyTitle': 'Blueprint is Empty',
        'editor.emptyDescription': 'Please set the writing intent and materials in the left configuration panel, then parse to generate a blueprint.',
        'editor.constructionComplete': 'Content Construction Complete:',
        'editor.nodesGenerated': 'All {count} nodes generated',
        'editor.readyForAudit': 'Ready for Integration & Audit',
        'editor.mergeAndAuditButton': 'Merge and Audit',

        // Audit Panel
        'audit.statusPassed': 'Passed',
        'audit.statusSuggestion': 'Suggestion',
        'audit.statusRisk': 'Risk',
        'audit.statusAnomaly': 'Anomaly',
        'audit.noResults': 'No audit results yet. Click the button above to run audit.',
        'audit.disclaimer': 'The audit report is generated based on AI analysis and is for reference only.',
        'audit.title': 'Audit Report',
        'audit.subtitle': 'Global Consistency and Fact Check',
        'audit.previewTitle': 'Full Preview',
        'audit.previewSubtitle': 'Integrated content preview',
        'audit.statusRefining': 'AI Refining...',
        'audit.statusAuditing': 'Auditing...',
        'audit.statusIntegrated': 'Integrated',
        'audit.runButton': 'Run Audit',
        'audit.auditingButton': 'Auditing...',
        'audit.passedCount': 'Passed',
        'audit.toastSuccess': 'Audit completed',
        'audit.toastFailed': 'Audit failed',
        'audit.toastError': 'Error occurred during audit',
        'audit.defaultPreview': '# Here is the integrated full-text preview\n\nThis document is intelligently generated by VibeWrite, combining your writing intent and all materials.\n\n## Section 1: Introduction\n\nThis is an example of automatically generated content.\n\n## Section 2: Main Body\n\nMore detailed content will be displayed here.\n\n## Section 3: Conclusion\n\nSummarize the views of the whole text.\n',

        // Node
        'node.status.pending': 'Pending',
        'node.status.generating': 'Generating',
        'node.status.completed': 'Completed',
        'node.status.error': 'Failed',
        'node.unnamed': 'Unnamed Node',
        'node.lock': 'Lock Node',
        'node.unlock': 'Unlock Node',
        'node.titleLabel': 'Node Title',
        'node.titlePlaceholder': 'Enter chapter title...',
        'node.descLabel': 'Node Description',
        'node.descPlaceholder': 'Describe the focus and key content of this node...',
        'node.previewLabel': 'Content Preview',
        'node.noContent': 'No content',
        'node.generatingContent': 'Generating content...',
        'node.waitingContent': 'Waiting to generate...',
        'node.regenerate': 'Regenerate',
        'node.deepEdit': 'Deep Edit',

        // Sidebar
        'sidebar.deepEditTitle': 'Chapter Deep Edit',
        'sidebar.customInstructions': 'Custom Instructions',
        'sidebar.customInstructionsDesc': 'Enter specific instructions, e.g., \'emphasize technical innovation\'',
        'sidebar.customInstructionsPlaceholder': 'Enter your personal requirements here...',
        'sidebar.customInstructionsTip': '* Instructions will be injected as high-weight background context',
        'sidebar.nodeMaterials': 'Node-level Materials',
        'sidebar.nodeMaterialsDesc': 'Upload reference materials for this node only, used only during this chapter\'s generation.',
        'sidebar.parsing': 'Parsing...',
        'sidebar.reparse': 'Reparse Node Materials',
        'sidebar.parse': 'Parse Node Materials',
        'sidebar.extractedFacts': 'Extracted Facts',
        'sidebar.regenerateContent': 'Regenerate Content',
        'sidebar.finishEdit': 'Finish Editing',

        // Toasts
        'toast.exportSuccess': 'Exported successfully',
        'toast.exportFailed': 'Export failed',
        'toast.intentRequired': 'Please enter writing intent',
        'toast.intentMaterialRequired': 'At least one of intent or materials is required',
        'toast.blueprintError': 'Error occurred during blueprint generation',
        'toast.exportedMarkdown': 'Exported as Markdown',
        'toast.exportedDocx': 'Exported as DOCX',
        'toast.exportedTxt': 'Exported as TXT',
    },
    ja: {
        appName: 'VibeWrite',
        title: 'VibeWrite - AI コラボレーティブライティングツール',
        description: 'コンセンサス駆動型でモジュール化された AI コラボレーションツール',

        // Header
        'networkStatus.online': 'オンライン',
        'networkStatus.offline': 'オフライン',
        currentLanguage: '現在の言語: {language}',
        autoDetect: 'IPで自動検出',

        // Layout labels
        act1Label: '執筆コンテキストの設定',
        act2Label: 'スマート生成ワークフロー',

        // Sidebar
        currentChapter: '現在の章',

        // UI Components
        generate: '生成',
        save: '保存',
        cancel: 'キャンセル',
        edit: '編集',
        delete: '削除',
        confirm: '確認',
        back: '戻る',
        next: '次へ',
        loading: '読み込み中...',
        error: 'エラー',
        success: '成功',
        warning: '警告',

        // Status messages
        generating: '生成中...',
        completed: '完了',
        failed: '失敗',
        regenerated: '再生成済み',
        generationFailed: '生成に失敗しました',

        // Audit messages
        autoCorrection: '自動修正: 事実の矛盾を解決',

        // Toast messages
        toastGenerated: '正常に生成されました',
        toastFailed: '生成に失敗しました。再試行してください',
        toastRegenerated: '再生成されました',
        toastGenerationFailed: '生成に失敗しました',

        // Placeholders
        placeholderSearch: '検索...',
        placeholderInput: '入力してください...',
        placeholderSelect: '選択してください...',

        // Integration Audit
        integrationAuditTitle: '統合と監査',
        integrationAuditDescription: 'すべての章の内容をインテリジェントに統合し、事実の正確性を検証',
        integrationStartTitle: '統合と監査を開始',
        integrationStartDescription: 'システムはインテリジェントな全文統合モードを使用し、素材に基づいて事実の正確性検証と自動修正を実行します',
        integrationButton: '全文統合',
        integrationButtonProcessing: '統合中...',
        contentTab: '統合された内容',
        auditTab: '監査レポート',
        finalContentTitle: '最終内容',
        finalContentDescription: 'すべての章が統合され、複数の形式でエクスポート可能',
        regenerateIntegration: '再統合',
        regenerateIntegrationProcessing: '再統合中...',
        exportMarkdown: 'Markdown',
        exportTxt: 'TXT',
        exportDocx: 'DOCX',
        generatedArticleTitle: '生成された記事タイトル',
        noTitleGenerated: 'タイトル未生成',
        regenerateTitleButton: 'タイトルを再生成',
        auditReportTitle: '監査レポート',
        auditReportDescription: 'グローバルな一貫性、論理性、および事実の正確性チェック',
        auditPassed: '通過',
        auditSuggestion: '提案',
        auditRisk: 'リスク',
        auditAnomaly: '監査異常',
        auditNoDescription: '説明が提供されていません',
        auditUnstructured: '監査結果が構造化されていません',
        backButton: '戻る',
        createNewProject: '新しいプロジェクトを作成',
        fullIntegration: '全文統合',
        integrationInProgress: '統合中...',
        unnamedArticle: '無題の記事',
        originalContent: '元の内容',
        correctedTo: '修正後',
        reason: '理由',

        // Blueprint Framework
        blueprintGenerationSuccess: 'フレームワーク生成成功、コンテンツ生成を開始します...',
        blueprintGenerationFailed: 'フレームワーク生成失敗',
        contentGenerationFailedRetry: '生成失敗、再試行してください',
        allContentGenerated: 'すべてのコンテンツ生成完了',
        contentRegenerated: '{title} 再生成されました',
        contentRegenerationFailed: '{title} 再生成失敗',
        smartGenerationTitle: 'スマート生成',
        smartGenerationDescription: 'あなたの執筆意図とグローバルコンテキストに基づいてモジュール的にコンテンツを生成',
        lockedNodesCount: '{count} ノードがロックされています、再生成時に保持されます',
        generatingInProgress: '生成中...',
        regenerateContent: '再生成',
        generateBlueprintButton: 'フレームワーク生成',
        generationProgressTitle: '生成進捗',
        parallelGenerationStatus: 'サブエージェントによる並列生成中...',
        materialParsingResult: '解析結果抽出',
        parseIntentAndMaterials: '執筆意図と素材を解析',
        parseIntentOnly: '執筆意図を解析',
        parseMaterialsOnly: '素材を解析',
        parsingInProgress: '解析中...',
        reparseMaterials: '素材を再解析',
        factSelectionTitle: '解析されたテーマ',
        factSelectionDescription: '執筆意図と素材から解析されたテーマ、クリックして有効/無効を切り替え',
        parsingCompleteNoFacts: '解析完了しましたが有効な事実は抽出されませんでした',
        partialParsingFailed: '素材の一部の解析に失敗',
        materialParsingSuccess: '素材解析成功',
        parsingFailed: '解析失敗',
        allFactsCleared: 'すべての解析された事実をクリアしました',
        parsingButtonText: '{intent}{materials}',
        'sidebar.expand': 'サイドバーを展開',
        'sidebar.collapse': 'サイドバーを折りたたむ',
        'column1.title': '構成パネル',
        'column1.show': '構成パネルを表示',
        'column1.hide': '構成パネルを非表示',
        'column1.flowIndicator': '生産キャンバスへの流れ',
        'column2.blueprintTitle': '編集',
        'column2.auditTitle': '監査パネル',
        'column2.blueprintTab': '編集',
        'column2.auditTab': '監査',
        'column2.nextToAudit': '次へ：監査',
        'column2.backToBlueprint': 'ブループリントに戻る',

        // Config Panel
        'config.intentTitle': '執筆意图',
        'config.intentDescription': '作成したいコンテンツの種類と目標を記述してください',
        'config.intentPlaceholder': '例：投資家向けの自社製品に関する市場分析レポートを作成する...',
        'config.materialTitle': '参考素材（任意）',
        'config.materialDescription': 'ファイルアップロードまたはリンク追加を参考素材として使用',
        'config.urlPlaceholder': 'URLを入力...',
        'config.addButton': '追加',
        'config.uploadButton': 'ファイルをアップロード',

        // Blueprint Editor
        'editor.emptyTitle': 'ブループリントが空です',
        'editor.emptyDescription': '左側の構成パネルで執筆意図と素材を設定し、解析してブループリントを生成してください。',
        'editor.constructionComplete': 'コンテンツ構築完了：',
        'editor.nodesGenerated': '全 {count} ノードが生成されました',
        'editor.readyForAudit': '統合と監査の準備完了',
        'editor.mergeAndAuditButton': '全文統合と監査',

        // Audit Panel
        'audit.statusPassed': '通過',
        'audit.statusSuggestion': '提案',
        'audit.statusRisk': 'リスク',
        'audit.statusAnomaly': '異常',
        'audit.noResults': '監査結果はまだありません。上のボタンをクリックして監査を実行してください。',
        'audit.disclaimer': '監査レポートはAI分析に基づいて生成されており、参考用です。',
        'audit.title': '監査レポート',
        'audit.subtitle': 'グローバルな一貫性と事実確認',
        'audit.previewTitle': '全文プレビュー',
        'audit.previewSubtitle': '統合されたコンテンツのプレビュー',
        'audit.statusRefining': 'AI書き換え中...',
        'audit.statusAuditing': '監査中...',
        'audit.statusIntegrated': '統合済み',
        'audit.runButton': '監査を実行',
        'audit.auditingButton': '監査中...',
        'audit.passedCount': '合格',
        'audit.toastSuccess': '監査完了',
        'audit.toastFailed': '監査失敗',
        'audit.toastError': '監査中にエラーが発生しました',
        'audit.defaultPreview': '# ここは統合された全文プレビューです\n\nこのドキュメントはVibeWriteによってインテリジェントに生成され、あなたの執筆意図とすべての素材が組み合わされています。\n\n## 第1節：はじめに\n\nこれは自動生成されたコンテンツの例です。\n\n## 第2節：本文\n\n詳細な内容はここに表示されます。\n\n## 第3節：結論\n\n全文の要約。\n',

        // Node
        'node.status.pending': '待機中',
        'node.status.generating': '生成中',
        'node.status.completed': '完了',
        'node.status.error': '失敗',
        'node.unnamed': '未命名ノード',
        'node.lock': 'ノードをロック',
        'node.unlock': 'ノードのロック解除',
        'node.titleLabel': 'ノードタイトル',
        'node.titlePlaceholder': '章のタイトルを入力...',
        'node.descLabel': 'ノードの説明',
        'node.descPlaceholder': 'このノードの執筆ポイントと主要な内容を説明してください...',
        'node.previewLabel': 'コンテンツプレビュー',
        'node.noContent': 'コンテンツなし',
        'node.generatingContent': 'コンテンツを生成中...',
        'node.waitingContent': '生成待機中...',
        'node.regenerate': '再生成',
        'node.deepEdit': 'ディープ編集',

        // Sidebar
        'sidebar.deepEditTitle': 'チャプターディープ編集',
        'sidebar.customInstructions': 'カスタム生成指示',
        'sidebar.customInstructionsDesc': '特定の指示を入力してください（例：技術革新を強調する）',
        'sidebar.customInstructionsPlaceholder': 'ここに個人的な要件を入力してください...',
        'sidebar.customInstructionsTip': '* 指示は生成時に高重みの背景コンテキストとして注入されます',
        'sidebar.nodeMaterials': 'ノードレベルの素材',
        'sidebar.nodeMaterialsDesc': 'このノード専用の参考資料をアップロードします。この章の生成時にのみ使用されます。',
        'sidebar.parsing': '解析中...',
        'sidebar.reparse': 'ノード素材を再解析',
        'sidebar.parse': 'ノード素材を解析',
        'sidebar.extractedFacts': '抽出されたナレッジポイント',
        'sidebar.regenerateContent': 'コンテンツを再生成',
        'sidebar.finishEdit': '編集完了',

        // Toasts
        'toast.exportSuccess': 'エクスポートに成功しました',
        'toast.exportFailed': 'エクスポートに失敗しました',
        'toast.intentRequired': '執筆意図を入力してください',
        'toast.intentMaterialRequired': '執筆意図または素材の少なくとも1つが必要です',
        'toast.blueprintError': 'ブループリントの生成中にエラーが発生しました',
        'toast.exportedMarkdown': 'Markdownとしてエクスポートされました',
        'toast.exportedDocx': 'DOCXとしてエクスポートされました',
        'toast.exportedTxt': 'TXTとしてエクスポートされました',
    },
    ko: {
        appName: 'VibeWrite',
        title: 'VibeWrite - AI 협업 작성 도구',
        description: '합의 기반 및 모듈식 생성을 기반으로 한 AI 협업 도구',

        // Header
        'networkStatus.online': '온라인',
        'networkStatus.offline': '오프라인',
        currentLanguage: '현재 언어: {language}',
        autoDetect: 'IP로 자동 감지',

        // Layout labels
        act1Label: '작성 컨텍스트 구성',
        act2Label: '스마트 생성 워크플로우',

        // Sidebar
        currentChapter: '현재 장',

        // UI Components
        generate: '생성',
        save: '저장',
        cancel: '취소',
        edit: '편집',
        delete: '삭제',
        confirm: '확인',
        back: '뒤로',
        next: '다음',
        loading: '로딩 중...',
        error: '오류',
        success: '성공',
        warning: '경고',

        // Status messages
        generating: '생성 중...',
        completed: '완료',
        failed: '실패',
        regenerated: '재생성됨',
        generationFailed: '생성 실패',

        // Audit messages
        autoCorrection: '자동 수정: 사실 충돌 해결됨',

        // Toast messages
        toastGenerated: '성공적으로 생성됨',
        toastFailed: '생성에 실패했습니다. 다시 시도하세요',
        toastRegenerated: '재생성됨',
        toastGenerationFailed: '생성에 실패했습니다',

        // Placeholders
        placeholderSearch: '검색...',
        placeholderInput: '입력하세요...',
        placeholderSelect: '선택하세요...',

        // Integration Audit
        integrationAuditTitle: '통합 및 감사',
        integrationAuditDescription: '모든 장의 내용을 지능적으로 통합하고 사실 정확성을 검증',
        integrationStartTitle: '통합 및 감사 시작',
        integrationStartDescription: '시스템은 지능적인 전체 텍스트 통합 모드를 사용하고 자료를 기반으로 사실 정확성 검증 및 자동 수정을 수행합니다',
        integrationButton: '전체 통합',
        integrationButtonProcessing: '통합 중...',
        contentTab: '통합된 내용',
        auditTab: '감사 보고서',
        finalContentTitle: '최종 내용',
        finalContentDescription: '모든 장이 통합되었으며 여러 형식으로 내보낼 수 있습니다',
        regenerateIntegration: '재통합',
        regenerateIntegrationProcessing: '재통합 중...',
        exportMarkdown: 'Markdown',
        exportTxt: 'TXT',
        exportDocx: 'DOCX',
        generatedArticleTitle: '생성된 기사 제목',
        noTitleGenerated: '제목이 생성되지 않았습니다',
        regenerateTitleButton: '제목 재생성',
        auditReportTitle: '감사 보고서',
        auditReportDescription: '글로벌 일관성, 논리성 및 사실 정확성 검사',
        auditPassed: '통과',
        auditSuggestion: '제안',
        auditRisk: '위험',
        auditAnomaly: '감사 이상',
        auditNoDescription: '설명이 제공되지 않았습니다',
        auditUnstructured: '감사 결과가 구조화되지 않았습니다',
        backButton: '뒤로',
        createNewProject: '새 프로젝트 만들기',
        fullIntegration: '전체 통합',
        integrationInProgress: '통합 중...',
        unnamedArticle: '제목 없는 기사',
        originalContent: '원본 내용',
        correctedTo: '수정됨',
        reason: '이유',

        // Blueprint Framework
        blueprintGenerationSuccess: '프레임워크 생성 성공, 콘텐츠 생성을 시작합니다...',
        blueprintGenerationFailed: '프레임워크 생성 실패',
        contentGenerationFailedRetry: '생성 실패, 다시 시도해주세요',
        allContentGenerated: '모든 콘텐츠 생성 완료',
        contentRegenerated: '{title} 재생성됨',
        contentRegenerationFailed: '{title} 재생성 실패',
        smartGenerationTitle: '스마트 생성',
        smartGenerationDescription: '작성 의도와 전역 컨텍스트를 기반으로 모듈식으로 콘텐츠 생성',
        lockedNodesCount: '{count} 노드가 잠겼으며 재생성 시 보존됩니다',
        generatingInProgress: '생성 중...',
        regenerateContent: '재생성',
        generateBlueprintButton: '프레임워크 생성',
        generationProgressTitle: '생성 진행 상황',
        parallelGenerationStatus: '하위 에이전트를 통한 병렬 생성 중...',
        materialParsingResult: '파싱 결과 추출',
        parseIntentAndMaterials: '작성 의도와 자료 파싱',
        parseIntentOnly: '작성 의도 파싱',
        parseMaterialsOnly: '자료 파싱',
        parsingInProgress: '파싱 중...',
        reparseMaterials: '자료 재파싱',
        factSelectionTitle: '파싱된 테마',
        factSelectionDescription: '작성 의도와 자료에서 파싱된 테마, 클릭하여 활성화 상태 전환',
        parsingCompleteNoFacts: '파싱 완료되었으나 유효한 사실이 추출되지 않았습니다',
        partialParsingFailed: '일부 자료 파싱 실패',
        materialParsingSuccess: '자료 파싱 성공',
        parsingFailed: '파싱 실패',
        allFactsCleared: '모든 파싱된 사실이 삭제되었습니다',
        parsingButtonText: '{intent}{materials}',
        'sidebar.expand': '사이드바 확장',
        'sidebar.collapse': '사이드바 접기',
        'column1.title': '구성 패널',
        'column1.show': '구성 패널 표시',
        'column1.hide': '구성 패널 숨기기',
        'column1.flowIndicator': '프로덕션 캔버스로 흐름',
        'column2.blueprintTitle': '편집',
        'column2.auditTitle': '감사 패널',
        'column2.blueprintTab': '편집',
        'column2.auditTab': '감사',
        'column2.nextToAudit': '다음: 감사',
        'column2.backToBlueprint': '블루프린트로 돌아가기',

        // Config Panel
        'config.intentTitle': '작성 의도',
        'config.intentDescription': '작성하려는 콘텐츠의 유형과 목표를 설명해 주세요',
        'config.intentPlaceholder': '예: 잠재적 투자자를 위한 회사 제품 시장 분석 보고서 작성...',
        'config.materialTitle': '참고 자료 (선택)',
        'config.materialDescription': '파일 업로드 또는 링크 추가를 참고 자료로 사용',
        'config.urlPlaceholder': 'URL 입력...',
        'config.addButton': '추가',
        'config.uploadButton': '파일 업로드',

        // Blueprint Editor
        'editor.emptyTitle': '블루프린트가 비어 있습니다',
        'editor.emptyDescription': '왼쪽 구성 패널에서 작성 의도와 자료를 설정한 다음 분석하여 블루프린트를 생성하세요.',
        'editor.constructionComplete': '콘텐츠 구축 완료:',
        'editor.nodesGenerated': '모든 {count}개 노드 생성됨',
        'editor.readyForAudit': '통합 및 감사 준비 완료',
        'editor.mergeAndAuditButton': '전체 통합 및 감사',

        // Audit Panel
        'audit.statusPassed': '통과',
        'audit.statusSuggestion': '제안',
        'audit.statusRisk': '위험',
        'audit.statusAnomaly': '이상',
        'audit.noResults': '아직 감사 결과가 없습니다. 위의 버튼을 클릭하여 감사를 실행하세요.',
        'audit.disclaimer': '감사 보고서는 AI 분석을 바탕으로 생성되었으며 참고용입니다.',
        'audit.title': '감사 보고서',
        'audit.subtitle': '전체 일관성 및 사실 확인',
        'audit.previewTitle': '전체 미리보기',
        'audit.previewSubtitle': '통합된 콘텐츠 미리보기',
        'audit.statusRefining': 'AI 수정 중...',
        'audit.statusAuditing': '감사 중...',
        'audit.statusIntegrated': '통합됨',
        'audit.runButton': '감사 실행',
        'audit.auditingButton': '감사 중...',
        'audit.passedCount': '통과',
        'audit.toastSuccess': '감사 완료',
        'audit.toastFailed': '감사 실패',
        'audit.toastError': '감사 중 오류가 발생했습니다',
        'audit.defaultPreview': '# 여기 통합된 전체 텍스트 미리보기입니다\n\n이 문서는 VibeWrite에 의해 지능적으로 생성되었으며, 사용자의 작성 의도와 모든 자료가 결합되었습니다.\n\n## 제1절: 서론\n\n이것은 자동 생성된 콘텐츠의 예입니다.\n\n## 제2절: 본론\n\n더 자세한 내용이 여기에 표시됩니다.\n\n## 제3절: 결론\n\n전체 내용을 요약합니다.\n',

        // Node
        'node.status.pending': '대기 중',
        'node.status.generating': '생성 중',
        'node.status.completed': '완료됨',
        'node.status.error': '생성 실패',
        'node.unnamed': '이름 없는 노드',
        'node.lock': '노드 잠금',
        'node.unlock': '노드 잠금 해제',
        'node.titleLabel': '노드 제목',
        'node.titlePlaceholder': '장 제목 입력...',
        'node.descLabel': '노드 설명',
        'node.descPlaceholder': '이 노드의 작성 중점 및 핵심 내용을 설명하세요...',
        'node.previewLabel': '콘텐츠 미리보기',
        'node.noContent': '콘텐츠 없음',
        'node.generatingContent': '콘텐츠 생성 중...',
        'node.waitingContent': '생성 대기 중...',
        'node.regenerate': '재생성',
        'node.deepEdit': '심층 편집',

        // Sidebar
        'sidebar.deepEditTitle': '장 심층 편집',
        'sidebar.customInstructions': '사용자 지정 생성 지침',
        'sidebar.customInstructionsDesc': '특정 지침을 입력하세요(예: 기술 혁신 강조)',
        'sidebar.customInstructionsPlaceholder': '여기에 개인적인 요구 사항을 입력하세요...',
        'sidebar.customInstructionsTip': '* 지침은 생성 시 가중치가 높은 배경 맥락으로 주입됩니다',
        'sidebar.nodeMaterials': '노드 레벨 자료',
        'sidebar.nodeMaterialsDesc': '이 노드에 대해서만 별도의 참고 자료를 업로드합니다. 이 장 생성 시에만 사용됩니다.',
        'sidebar.parsing': '분석 중...',
        'sidebar.reparse': '노드 자료 재분석',
        'sidebar.parse': '노드 자료 분석',
        'sidebar.extractedFacts': '추출된 지식 포인트',
        'sidebar.regenerateContent': '콘텐츠 재생성',
        'sidebar.finishEdit': '편집 완료',

        // Toasts
        'toast.exportSuccess': '내보내기 성공',
        'toast.exportFailed': '내보내기 실패',
        'toast.intentRequired': '작성 의도를 입력하세요',
        'toast.intentMaterialRequired': '작성 의도 또는 참고 자료 중 하나는 입력해야 합니다',
        'toast.blueprintError': '블루프린트 생성 중 오류가 발생했습니다',
        'toast.exportedMarkdown': 'Markdown으로 내보냈습니다',
        'toast.exportedDocx': 'DOCX로 내보냈습니다',
        'toast.exportedTxt': 'TXT로 내보냈습니다',
    }
} as const

// Helper function to get translation with optional parameters
export function t(key: TranslationKey, params?: Record<string, string>): string {
    const language = useVibeWriteStore.getState().language
    let text = translations[language][key] as string

    // Replace parameters if provided
    if (params) {
        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(`{${param}}`, value)
        })
    }

    return text
}

// Hook for use in components
export function useTranslation() {
    const language = useVibeWriteStore(state => state.language)

    return {
        t: (key: TranslationKey, params?: Record<string, string>) => {
            let text = translations[language][key] as string

            if (params) {
                Object.entries(params).forEach(([param, value]) => {
                    text = text.replace(`{${param}}`, value)
                })
            }

            return text
        },
        language
    }
}