"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MaterialUploader } from "@/components/material-uploader"
import { AtomicFactsList } from "@/components/atomic-facts-list"
import {
  ArrowRight,
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Sparkles,
  FileText,
  RefreshCw,
  Lock,
  Unlock,
  Globe,
} from "lucide-react"
import { Switch } from "@/components/ui/switch"
import type { BlueprintNode, Material, AtomicFact } from "@/lib/types"
import { generateBlueprint, injectNodeContext } from "@/app/actions/blueprint"
import { toast } from "sonner"

// Dnd Kit Imports
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { SortableBlueprintNode } from "@/components/sortable-blueprint-node"

interface BlueprintFrameworkProps {
  globalContext: any
  initialData?: any
  onNext: (data: any) => void
  onBack: () => void
}

export function BlueprintFramework({ globalContext, initialData, onNext, onBack }: BlueprintFrameworkProps) {
  const [nodes, setNodes] = useState<BlueprintNode[]>(initialData?.nodes || [])
  const [expandedNode, setExpandedNode] = useState<string | null>(null)
  const [isGeneratingBlueprint, setIsGeneratingBlueprint] = useState(false)
  const [hasGeneratedBlueprint, setHasGeneratedBlueprint] = useState(false)
  const [nodeParsedStatus, setNodeParsedStatus] = useState<Record<string, boolean>>({})
  const [nodeParsingStatus, setNodeParsingStatus] = useState<Record<string, boolean>>({})
  const [nodeDisabledFacts, setNodeDisabledFacts] = useState<Record<string, Set<string>>>({})
  const [isSearchEnabled, setIsSearchEnabled] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [hasAutoTriggered, setHasAutoTriggered] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Auto-trigger generation if no nodes exist and not yet triggered
  useEffect(() => {
    if (isMounted && nodes.length === 0 && !hasAutoTriggered && !isGeneratingBlueprint && !hasGeneratedBlueprint) {
      setHasAutoTriggered(true)
      handleGenerateBlueprint()
    }
  }, [isMounted, nodes.length, hasAutoTriggered, isGeneratingBlueprint, hasGeneratedBlueprint])


  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleToggleLock = (nodeId: string) => {
    setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, locked: !node.locked } : node)))
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setNodes((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id)
        const newIndex = items.findIndex((i) => i.id === over.id)

        const newNodes = arrayMove(items, oldIndex, newIndex)
        // Re-assign order based on new sequence
        return newNodes.map((node, index) => ({
          ...node,
          order: index + 1,
        }))
      })
    }
  }

  const handleGenerateBlueprint = async () => {
    setIsGeneratingBlueprint(true)

    // Extract enabled global facts based on IDs from globalContext
    // globalContext follows { intent, materials, selectedFacts: string[], formData } structure
    const allMaterials = globalContext.materials as Material[]
    const enabledFactIds = new Set(globalContext.selectedFacts as string[])

    const globalFacts = allMaterials
      .flatMap(m => m.facts)
      .filter(f => enabledFactIds.has(f.id))
      .map(f => f.content)

    // Include the intent as a base fact if not already covered
    if (globalContext.intent) {
      globalFacts.unshift(`Core Intent: ${globalContext.intent}`)
    }

    const lockedNodesInfo = nodes
      .filter(n => n.locked)
      .map(n => ({ title: n.title, description: n.description }))

    const result = await generateBlueprint(globalFacts, globalContext.formData, isSearchEnabled, lockedNodesInfo)

    if (result.success && result.data) {
      const lockedNodeIds = new Set(nodes.filter(n => n.locked).map(n => n.id))

      const generatedNodes: BlueprintNode[] = result.data.map((node: any, index: number) => {
        let nodeId = node.id || `node-${Date.now()}-${index}`
        // Ensure ID uniqueness against locked nodes
        if (lockedNodeIds.has(nodeId)) {
          nodeId = `gen-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`
        }
        return {
          id: nodeId,
          title: node.title,
          description: node.description,
          order: index + 1,
          materials: [],
          localFacts: [],
          locked: false,
          estimatedWordCount: node.estimatedWordCount
        }
      })

      // Merge with existing locked nodes if any
      const lockedNodes = nodes.filter(n => n.locked).sort((a, b) => a.order - b.order)

      let finalNodes: BlueprintNode[] = []
      let genIdx = 0

      // We want to preserve the relative positions of locked nodes if possible.
      // We fill slots with locked nodes at their 'order' and fill gaps with generated nodes.
      const maxOrder = lockedNodes.length > 0 ? Math.max(...lockedNodes.map(n => n.order)) : 0
      const totalEstimated = Math.max(maxOrder, generatedNodes.length + lockedNodes.length)

      for (let i = 1; i <= totalEstimated; i++) {
        const lockedAtThisPos = lockedNodes.find(n => n.order === i)
        if (lockedAtThisPos) {
          finalNodes.push(lockedAtThisPos)
        } else if (genIdx < generatedNodes.length) {
          finalNodes.push(generatedNodes[genIdx])
          genIdx++
        }
      }

      // Append any remaining generated nodes
      while (genIdx < generatedNodes.length) {
        finalNodes.push(generatedNodes[genIdx])
        genIdx++
      }

      // Re-assign order for everyone to ensure 1, 2, 3... sequence
      finalNodes = finalNodes.map((node, index) => ({
        ...node,
        order: index + 1
      }))

      setNodes(finalNodes)
      setExpandedNode(null)
      setHasGeneratedBlueprint(true)
    } else {
      console.error("Failed to generate blueprint")
      // Optionally show toast error
    }

    setIsGeneratingBlueprint(false)
  }

  const handleAddNode = () => {
    const newNode: BlueprintNode = {
      id: `node-${Date.now()}`,
      title: "",
      description: "",
      order: nodes.length + 1,
      materials: [],
      localFacts: [],
      locked: false,
    }
    setNodes([...nodes, newNode])
    setExpandedNode(newNode.id)
  }

  const handleRemoveNode = (nodeId: string) => {
    setNodes(nodes.filter((n) => n.id !== nodeId).map((node, index) => ({
      ...node,
      order: index + 1
    })))
  }

  const handleNodeChange = (nodeId: string, field: keyof BlueprintNode, value: any) => {
    setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, [field]: value } : node)))
  }

  const handleNodeMaterialsChange = (nodeId: string, materials: Material[]) => {
    setNodes(nodes.map((node) => (node.id === nodeId ? { ...node, materials } : node)))
  }

  const handleNodeFactToggle = (nodeId: string, materialId: string, factId: string) => {
    setNodes(
      nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            materials: node.materials.map((material) => {
              if (material.id === materialId) {
                const fact = material.facts.find((f) => f.id === factId)
                if (fact) {
                  setNodeDisabledFacts((prev) => {
                    const nodeDisabled = new Set(prev[nodeId] || [])
                    if (fact.enabled) {
                      nodeDisabled.add(factId)
                    } else {
                      nodeDisabled.delete(factId)
                    }
                    return { ...prev, [nodeId]: nodeDisabled }
                  })
                }
                return {
                  ...material,
                  facts: material.facts.map((fact) =>
                    fact.id === factId ? { ...fact, enabled: !fact.enabled } : fact,
                  ),
                }
              }
              return material
            }),
          }
        }
        return node
      }),
    )
  }

  const handleParseMaterials = async (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return

    setNodeParsingStatus((prev) => ({ ...prev, [nodeId]: true }))

    // Read files on client side
    const fileContents: string[] = []
    const urls: string[] = []
    const urlNames: string[] = []

    for (const material of node.materials) {
      if (material.type === 'file' && material.file) {
        try {
          const text = await material.file.text()
          fileContents.push(text)
        } catch (error) {
          console.error(`Failed to read file ${material.name}:`, error)
          fileContents.push('')
        }
      } else if (material.type === 'url' && material.url) {
        urls.push(material.url)
        urlNames.push(material.name)
      }
    }

    if (fileContents.length === 0 && urls.length === 0) {
      setNodeParsingStatus((prev) => ({ ...prev, [nodeId]: false }))
      return
    }

    const formData = new FormData()
    formData.append('nodeDescription', node.description || node.title)
    formData.append('searchEnabled', String(!!node.searchEnabled))

    fileContents.forEach(content => {
      formData.append('fileContents', content)
    })
    urls.forEach(url => {
      formData.append('urls', url)
    })
    urlNames.forEach(name => {
      formData.append('urlNames', name)
    })

    const result = await injectNodeContext(formData)

    if (result.success && result.data) {
      if (result.failedUrls && result.failedUrls.length > 0) {
        toast.warning("部分节点素材解析失败", {
          description: `以下链接无法访问：${result.failedUrls.join(", ")}`,
          duration: 5000,
        })
      }

      const newFacts: AtomicFact[] = result.data.map((fact: string, idx: number) => ({
        id: `node-fact-${nodeId}-${Date.now()}-${idx}`,
        content: fact,
        source: "Node Material Analysis",
        enabled: true
      }))

      // Add a virtual material to hold these facts
      const virtualMaterial: Material = {
        id: `parsed-${nodeId}-${Date.now()}`,
        type: "file", // treated as file for icon
        name: "解析结果提取",
        facts: newFacts
      }

      setNodes(nodes.map(n => {
        if (n.id === nodeId) {
          // Remove old virtual materials if any? Or keep appending?
          // Let's append or replace specifically the "Parsed Result" one.
          const realMaterials = n.materials.filter(m => m.name !== "解析结果提取")
          return { ...n, materials: [...realMaterials, virtualMaterial] }
        }
        return n
      }))

      setNodeParsedStatus((prev) => ({ ...prev, [nodeId]: true }))
    }

    setNodeParsingStatus((prev) => ({ ...prev, [nodeId]: false }))
  }

  const canParseNode = (node: BlueprintNode): boolean => {
    return !!(node.description.trim() || node.materials.length > 0)
  }

  const hasNodeFacts = (node: BlueprintNode) => {
    return node.materials.some((m) => m.facts.length > 0)
  }

  const canProceed = nodes.length > 0 && nodes.every((n) => n.title.trim())

  if (!isMounted) return null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-balance">蓝图框架规划</h2>
        <p className="mt-2 text-muted-foreground">拆解写作任务为结构化节点，每个节点可配置独立的参考素材</p>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-medium">AI 智能生成框架</h3>
            <p className="mt-1 text-sm text-muted-foreground">基于您的写作意图和全局背景，自动生成章节结构</p>
            {nodes.some((n) => n.locked) && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                已锁定 {nodes.filter((n) => n.locked).length} 个节点，重新生成时将保留
              </p>
            )}
            <div className="mt-4 flex items-center gap-2 border-t pt-4">
              <Switch
                id="global-search"
                checked={isSearchEnabled}
                onCheckedChange={setIsSearchEnabled}
                disabled={isGeneratingBlueprint}
              />
              <Label htmlFor="global-search" className="flex items-center gap-2 cursor-pointer">
                <Globe className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">启用联网搜索生成框架</span>
              </Label>
            </div>
          </div>
          <Button
            onClick={handleGenerateBlueprint}
            disabled={isGeneratingBlueprint}
            variant={hasGeneratedBlueprint ? "outline" : "default"}
          >
            {isGeneratingBlueprint ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : hasGeneratedBlueprint ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                重新生成蓝图
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                生成蓝图
              </>
            )}
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={nodes.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            {nodes.map((node, index) => (
              <SortableBlueprintNode
                key={node.id}
                node={node}
                index={index}
                expandedNode={expandedNode}
                setExpandedNode={setExpandedNode}
                handleToggleLock={handleToggleLock}
                handleRemoveNode={handleRemoveNode}
                handleNodeChange={handleNodeChange}
                handleNodeMaterialsChange={handleNodeMaterialsChange}
                handleNodeFactToggle={handleNodeFactToggle}
                handleParseMaterials={handleParseMaterials}
                nodeParsingStatus={nodeParsingStatus}
                nodeParsedStatus={nodeParsedStatus}
                canParseNode={canParseNode}
                hasNodeFacts={hasNodeFacts}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <Button onClick={handleAddNode} variant="outline" className="w-full bg-transparent">
        <Plus className="mr-2 h-4 w-4" />
        添加节点
      </Button>

      <div className="flex justify-between gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="bg-transparent">
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button onClick={() => onNext({ nodes, globalContext })} disabled={!canProceed} size="lg">
          下一步：模块生产
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
