"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MaterialUploader } from "@/components/material-uploader"
import { AtomicFactsList } from "@/components/atomic-facts-list"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Globe, GripVertical, Lock, Unlock, Trash2, FileText, Sparkles, RefreshCw, Check, AlertCircle, Clock, Loader2 } from "lucide-react"
import type { BlueprintNode, Material } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"


interface SortableBlueprintNodeProps {
    node: BlueprintNode
    index: number
    expandedNode: string | null
    setExpandedNode: (id: string | null) => void
    handleToggleLock: (nodeId: string) => void
    handleRemoveNode: (nodeId: string) => void
    handleNodeChange: (nodeId: string, field: keyof BlueprintNode, value: any) => void
    // 移除行内素材处理相关的 props，因为移到了侧栏
    generatedContent?: { content: string; status: "pending" | "generating" | "completed" | "error" }
    isGeneratingOverall?: boolean
    onOpenDeepEdit: (nodeId: string) => void // 新增深度编辑回调
    onRegenerateContent?: (nodeId: string) => void // 恢复重新生成回调
}

export function SortableBlueprintNode({
    node,
    index,
    expandedNode,
    setExpandedNode,
    handleToggleLock,
    handleRemoveNode,
    handleNodeChange,
    generatedContent,
    isGeneratingOverall,
    onOpenDeepEdit,
    onRegenerateContent,
}: SortableBlueprintNodeProps) {
    const { t } = useTranslation()
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: node.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 0,
        position: 'relative' as const,
    }

    // 获取节点状态用于显示
    const nodeStatus = generatedContent?.status || node.status || 'pending'

    // 状态配置
    const statusConfig = {
        pending: {
            color: 'bg-slate-400',
            bgColor: 'bg-slate-100 dark:bg-slate-800',
            textColor: 'text-slate-600 dark:text-slate-400',
            icon: Clock,
            label: t('node.status.pending'),
            animate: false
        },
        generating: {
            color: 'bg-blue-500',
            bgColor: 'bg-blue-100 dark:bg-blue-900/30',
            textColor: 'text-blue-600 dark:text-blue-400',
            icon: Loader2,
            label: t('node.status.generating'),
            animate: true
        },
        completed: {
            color: 'bg-emerald-500',
            bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
            textColor: 'text-emerald-600 dark:text-emerald-400',
            icon: Check,
            label: t('node.status.completed'),
            animate: false
        },
        error: {
            color: 'bg-red-500',
            bgColor: 'bg-red-100 dark:bg-red-900/30',
            textColor: 'text-red-600 dark:text-red-400',
            icon: AlertCircle,
            label: t('node.status.error'),
            animate: false
        }
    }

    const currentStatus = statusConfig[nodeStatus as keyof typeof statusConfig] || statusConfig.pending
    const StatusIcon = currentStatus.icon

    const hasNodeFacts = (node: BlueprintNode) => node.materials.some((m) => m.facts.length > 0)

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={`overflow-hidden relative ${node.locked ? "ring-2 ring-amber-500/50" : ""} ${isDragging ? "opacity-50 shadow-lg" : ""} ${nodeStatus === 'generating' ? 'ring-1 ring-blue-400/50' : ''}`}>
                {/* 左侧状态指示条 */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${currentStatus.color} ${currentStatus.animate ? 'animate-pulse' : ''}`} />

                <div
                    className="flex cursor-pointer items-center gap-3 py-3 pl-4 pr-3 hover:bg-accent/5"
                    onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                >
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 text-xs font-semibold text-accent-foreground">
                        {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">{node.title || t('node.unnamed')}</h3>
                            {node.locked && <Lock className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />}
                        </div>
                        {node.description && expandedNode !== node.id && (
                            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{node.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* 状态 Badge */}
                        <Badge
                            variant="secondary"
                            className={`text-[10px] px-1.5 py-0 h-5 ${currentStatus.bgColor} ${currentStatus.textColor} border-0`}
                        >
                            <StatusIcon className={`h-3 w-3 mr-1 ${currentStatus.animate ? 'animate-spin' : ''}`} />
                            {currentStatus.label}
                        </Badge>

                        {node.materials.length > 0 && (
                            <div className="flex items-center gap-0.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                                <FileText className="h-2.5 w-2.5" />
                                {node.materials.filter((m) => m.name !== "节点解析结果").length || node.materials.length}
                            </div>
                        )}
                        {hasNodeFacts(node) && (
                            <div className="flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                                <Sparkles className="h-2.5 w-2.5" />
                                {node.materials.reduce((sum, m) => sum + m.facts.filter((f) => f.enabled).length, 0)}
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleToggleLock(node.id)
                            }}
                            title={node.locked ? t('node.unlock') : t('node.lock')}
                        >
                            {node.locked ? <Lock className="h-3.5 w-3.5 text-amber-500" /> : <Unlock className="h-3.5 w-3.5" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveNode(node.id)
                            }}
                            disabled={node.locked}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>

                {expandedNode === node.id && (
                    <div className="space-y-4 border-t border-border bg-card p-4">
                        <div className="space-y-2">
                            <Label htmlFor={`title-${node.id}`}>{t('node.titleLabel')}</Label>
                            <Input
                                id={`title-${node.id}`}
                                placeholder={t('node.titlePlaceholder')}
                                value={node.title}
                                onChange={(e) => handleNodeChange(node.id, "title", e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`description-${node.id}`}>{t('node.descLabel')}</Label>
                            <Textarea
                                id={`description-${node.id}`}
                                placeholder={t('node.descPlaceholder')}
                                value={node.description}
                                onChange={(e) => handleNodeChange(node.id, "description", e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        {/* Generated Content Preview & Actions */}
                        <div className="pt-4 border-t space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>{t('node.previewLabel')}</Label>
                            </div>

                            {generatedContent ? (
                                <div className="text-sm bg-muted/30 p-3 rounded-md min-h-[100px] whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                                    {generatedContent.status === 'generating' ? (
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Sparkles className="h-4 w-4 animate-spin" />
                                            {t('node.generatingContent')}
                                        </div>
                                    ) : generatedContent.status === 'error' ? (
                                        <span className="text-red-500">{generatedContent.content}</span>
                                    ) : (
                                        generatedContent.content || <span className="text-muted-foreground italic">{t('node.noContent')}</span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground italic bg-muted/10 p-3 rounded-md">
                                    {t('node.waitingContent')}
                                </div>
                            )}

                            {onRegenerateContent && (
                                <Button
                                    variant="outline"
                                    className="w-full gap-2 border-dashed mb-2"
                                    onClick={() => onRegenerateContent(node.id)}
                                    disabled={isGeneratingOverall || generatedContent?.status === 'generating'}
                                >
                                    <RefreshCw className={`h-4 w-4 ${generatedContent?.status === 'generating' ? 'animate-spin' : ''}`} />
                                    {generatedContent?.status === 'generating' ? t('node.status.generating') : t('node.regenerate')}
                                </Button>
                            )}

                            <Button
                                variant="outline"
                                className="w-full gap-2 border-dashed"
                                onClick={() => onOpenDeepEdit(node.id)}
                            >
                                <Sparkles className="h-4 w-4" />
                                {t('node.deepEdit')}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
