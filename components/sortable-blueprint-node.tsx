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
import { Globe, GripVertical, Lock, Unlock, Trash2, FileText, Sparkles, RefreshCw } from "lucide-react"
import type { BlueprintNode, Material } from "@/lib/types"

interface SortableBlueprintNodeProps {
    node: BlueprintNode
    index: number
    expandedNode: string | null
    setExpandedNode: (id: string | null) => void
    handleToggleLock: (nodeId: string) => void
    handleRemoveNode: (nodeId: string) => void
    handleNodeChange: (nodeId: string, field: keyof BlueprintNode, value: any) => void
    handleNodeMaterialsChange: (nodeId: string, materials: Material[]) => void
    handleNodeFactToggle: (nodeId: string, materialId: string, factId: string) => void
    handleParseMaterials: (nodeId: string) => void
    nodeParsingStatus: Record<string, boolean>
    nodeParsedStatus: Record<string, boolean>
    canParseNode: (node: BlueprintNode) => boolean
    hasNodeFacts: (node: BlueprintNode) => boolean
}

export function SortableBlueprintNode({
    node,
    index,
    expandedNode,
    setExpandedNode,
    handleToggleLock,
    handleRemoveNode,
    handleNodeChange,
    handleNodeMaterialsChange,
    handleNodeFactToggle,
    handleParseMaterials,
    nodeParsingStatus,
    nodeParsedStatus,
    canParseNode,
    hasNodeFacts,
}: SortableBlueprintNodeProps) {
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

    return (
        <div ref={setNodeRef} style={style}>
            <Card className={`overflow-hidden ${node.locked ? "ring-2 ring-amber-500/50" : ""} ${isDragging ? "opacity-50 shadow-lg" : ""}`}>
                <div
                    className="flex cursor-pointer items-center gap-3 p-4 hover:bg-accent/5"
                    onClick={() => setExpandedNode(expandedNode === node.id ? null : node.id)}
                >
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <GripVertical className="h-5 w-5" />
                    </div>
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-accent/10 text-sm font-semibold text-accent-foreground">
                        {index + 1}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h3 className="font-medium">{node.title || "未命名节点"}</h3>
                            {node.locked && <Lock className="h-4 w-4 text-amber-500" />}
                        </div>
                        {node.description && (
                            <p className="mt-1 text-sm text-muted-foreground line-clamp-1">{node.description}</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {node.materials.length > 0 && (
                            <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                <FileText className="h-3 w-3" />
                                {node.materials.filter((m) => m.name !== "节点解析结果").length || node.materials.length}
                            </div>
                        )}
                        {hasNodeFacts(node) && (
                            <div className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                                <Sparkles className="h-3 w-3" />
                                {node.materials.reduce((sum, m) => sum + m.facts.filter((f) => f.enabled).length, 0)}
                            </div>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleToggleLock(node.id)
                            }}
                            title={node.locked ? "解锁节点" : "锁定节点"}
                            className={node.locked ? "text-amber-500 hover:text-amber-600" : ""}
                        >
                            {node.locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveNode(node.id)
                            }}
                            disabled={node.locked}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {expandedNode === node.id && (
                    <div className="space-y-4 border-t border-border bg-card p-4">
                        <div className="space-y-2">
                            <Label htmlFor={`title-${node.id}`}>节点标题</Label>
                            <Input
                                id={`title-${node.id}`}
                                placeholder="输入章节标题..."
                                value={node.title}
                                onChange={(e) => handleNodeChange(node.id, "title", e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`description-${node.id}`}>节点描述</Label>
                            <Textarea
                                id={`description-${node.id}`}
                                placeholder="描述本节点的写作重点和关键内容..."
                                value={node.description}
                                onChange={(e) => handleNodeChange(node.id, "description", e.target.value)}
                                onMouseDown={(e) => e.stopPropagation()}
                                rows={3}
                                className="resize-none"
                            />
                        </div>

                        <div className="space-y-3">
                            <div>
                                <Label>节点级素材</Label>
                                <p className="text-sm text-muted-foreground">为该节点单独上传参考资料，仅在此章节使用</p>
                            </div>

                            <div onMouseDown={(e) => e.stopPropagation()}>
                                <MaterialUploader
                                    materials={node.materials.filter((m) => m.name !== "解析结果提取")}
                                    onMaterialsChange={(materials) => handleNodeMaterialsChange(node.id, materials)}
                                />
                            </div>


                            {canParseNode(node) && (
                                <Button
                                    onClick={() => handleParseMaterials(node.id)}
                                    variant="outline"
                                    size="sm"
                                    className="w-full bg-transparent"
                                    disabled={nodeParsingStatus[node.id]}
                                >
                                    {nodeParsingStatus[node.id] ? (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                                            解析中...
                                        </>
                                    ) : nodeParsedStatus[node.id] ? (
                                        <>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            重新解析节点素材
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            解析节点素材
                                        </>
                                    )}
                                </Button>
                            )}

                            {hasNodeFacts(node) && (
                                <div className="mt-3" onMouseDown={(e) => e.stopPropagation()}>
                                    <AtomicFactsList
                                        materials={node.materials}
                                        onFactToggle={(materialId, factId) => handleNodeFactToggle(node.id, materialId, factId)}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    )
}
