import * as React from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MaterialUploader } from "@/components/material-uploader"
import { AtomicFactsList } from "@/components/atomic-facts-list"
import { X, Sparkles, FileText, RefreshCw, Loader2, Check, AlertCircle } from "lucide-react"
import type { BlueprintNode, Material, AtomicFact } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"

interface ChapterDeepEditSidebarProps {
    node: BlueprintNode
    onClose: () => void
    onSave?: () => void
    onNodeChange: (nodeId: string, field: keyof BlueprintNode, value: any) => void
    onNodeMaterialsChange: (nodeId: string, materials: Material[]) => void
    onNodeFactToggle: (nodeId: string, materialId: string, factId: string) => void
    handleParseMaterials: (nodeId: string) => void
    nodeParsingStatus: Record<string, boolean>
    nodeParsedStatus: Record<string, boolean>
    onPromptChange: (nodeId: string, prompt: string) => void
    customPrompt?: string
    isGeneratingOverall?: boolean
    onRegenerateContent?: (nodeId: string) => void
    generatedContent?: { content: string; status: "pending" | "generating" | "completed" | "error" }
}

export function ChapterDeepEditSidebar({
    node,
    onClose,
    onSave,
    onNodeChange,
    onNodeMaterialsChange,
    onNodeFactToggle,
    handleParseMaterials,
    nodeParsingStatus,
    nodeParsedStatus,
    onPromptChange,
    customPrompt,
    isGeneratingOverall,
    onRegenerateContent,
    generatedContent,
}: ChapterDeepEditSidebarProps) {
    const { t } = useTranslation()
    const canParseNode = !!(node.description.trim() || node.materials.length > 0)
    const hasNodeFacts = node.materials.some((m) => m.facts.length > 0)

    return (
        <div className="flex flex-col h-full bg-background border-l shadow-xl animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">{t('sidebar.deepEditTitle')}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Node Info Edit */}
                <div className="space-y-4">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('currentChapter')}</div>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`sidebar-title-${node.id}`} className="text-sm font-semibold">{t('node.titleLabel')}</Label>
                            <Input
                                id={`sidebar-title-${node.id}`}
                                value={node.title}
                                onChange={(e) => onNodeChange(node.id, "title", e.target.value)}
                                placeholder={t('node.titlePlaceholder')}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`sidebar-desc-${node.id}`} className="text-sm font-semibold">{t('node.descLabel')}</Label>
                            <Textarea
                                id={`sidebar-desc-${node.id}`}
                                value={node.description}
                                onChange={(e) => onNodeChange(node.id, "description", e.target.value)}
                                placeholder={t('node.descPlaceholder')}
                                rows={3}
                                className="resize-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Custom Instructions */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                        <Sparkles className="h-4 w-4" />
                        {t('sidebar.customInstructions')}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`prompt-sidebar-${node.id}`} className="text-xs text-muted-foreground">
                            {t('sidebar.customInstructionsDesc')}
                        </Label>
                        <Textarea
                            id={`prompt-sidebar-${node.id}`}
                            placeholder={t('sidebar.customInstructionsPlaceholder')}
                            value={customPrompt || ""}
                            onChange={(e) => onPromptChange(node.id, e.target.value)}
                            rows={4}
                            className="resize-none bg-muted/30 focus:bg-background transition-colors"
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground italic">
                        {t('sidebar.customInstructionsTip')}
                    </p>
                </div>

                {/* Node Materials */}
                <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm font-semibold">
                            <FileText className="h-4 w-4" />
                            {t('sidebar.nodeMaterials')}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {t('sidebar.nodeMaterialsDesc')}
                    </p>

                    <div className="mt-2">
                        <MaterialUploader
                            materials={node.materials.filter((m) => m.name !== "解析结果提取" && m.name !== "节点解析结果")}
                            onMaterialsChange={(materials) => onNodeMaterialsChange(node.id, materials)}
                        />
                    </div>

                    {canParseNode && (
                        <Button
                            onClick={() => handleParseMaterials(node.id)}
                            variant="outline"
                            size="sm"
                            className="w-full h-9 text-xs gap-2"
                            disabled={nodeParsingStatus[node.id]}
                        >
                            {nodeParsingStatus[node.id] ? (
                                <>
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                    {t('sidebar.parsing')}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {nodeParsedStatus[node.id] ? t('sidebar.reparse') : t('sidebar.parse')}
                                </>
                            )}
                        </Button>
                    )}

                    {hasNodeFacts && (
                        <div className="mt-6 pt-4 border-t border-dashed">
                            <div className="text-xs font-semibold mb-3 text-muted-foreground">{t('sidebar.extractedFacts')}</div>
                            <AtomicFactsList
                                materials={node.materials}
                                onFactToggle={(materialId, factId) => onNodeFactToggle(node.id, materialId, factId)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Footer / Actions */}
            <div className="p-4 border-t bg-muted/20 space-y-3">
                {onRegenerateContent && (
                    <Button
                        className="w-full"
                        variant="default"
                        onClick={() => onRegenerateContent(node.id)}
                        disabled={isGeneratingOverall || generatedContent?.status === 'generating'}
                    >
                        {generatedContent?.status === 'generating' ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t('node.generatingContent')}
                            </>
                        ) : (
                            <>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                {t('sidebar.regenerateContent')}
                            </>
                        )}
                    </Button>
                )}
                <Button className="w-full" variant="outline" onClick={onSave || onClose}>
                    {t('sidebar.finishEdit')}
                </Button>
            </div>
        </div>
    )
}
