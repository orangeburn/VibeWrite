"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import { useTranslation } from "@/lib/i18n"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { SortableBlueprintNode } from "./sortable-blueprint-node"
import { writeNodeContent } from "@/app/actions/production"
import { Plus, RefreshCw, Lock, Unlock, Shield, Sparkles, ArrowRight, ChevronRight } from "lucide-react"
import { ChapterDeepEditSidebar } from "./chapter-deep-edit-sidebar"
import { analyzeIntent, deduplicateFacts } from "@/app/actions/setup"
import { auditContent, refineFullArticle } from "@/app/actions/production"
import { toast } from "sonner"
import * as mammoth from "mammoth"
import { AtomicFact, Material } from "@/lib/types"

export function BlueprintEditor() {
  const { t } = useTranslation()
  const {
    blueprintNodes,
    reorderBlueprintNodes,
    updateBlueprintNode,
    atomicFacts,
    shouldAutoGenerate,
    setShouldAutoGenerate,
    productionResult,
    setProductionResult,
    setActiveFold2Page,
    isSearchEnabled,
    intent,
    formData,
  } = useVibeWriteStore()

  const [expandedNode, setExpandedNode] = React.useState<string | null>(null)
  const [generatedContents, setGeneratedContents] = React.useState<Record<string, { content: string; status: "pending" | "generating" | "completed" | "error" }>>({})
  const [generatingNodes, setGeneratingNodes] = React.useState<Set<string>>(new Set())
  const [nodeParsingStatus, setNodeParsingStatus] = React.useState<Record<string, boolean>>({})
  const [nodeParsedStatus, setNodeParsedStatus] = React.useState<Record<string, boolean>>({})

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Sync internal generatedContents with store blueprintNodes (e.g., when switching history)
  React.useEffect(() => {
    const syncContents: Record<string, { content: string; status: "pending" | "generating" | "completed" | "error" }> = {}
    blueprintNodes.forEach(node => {
      if (node.content || node.status !== 'pending') {
        syncContents[node.id] = {
          content: node.content || "",
          status: node.status
        }
      }
    })
    setGeneratedContents(syncContents)
  }, [blueprintNodes])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = blueprintNodes.findIndex(node => node.id === active.id)
      const newIndex = blueprintNodes.findIndex(node => node.id === over.id)

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderBlueprintNodes(oldIndex, newIndex)
      }
    }
  }



  const handleNodeClick = (nodeId: string) => {
    // Placeholder for node click (open side editor)
    console.log('Node clicked:', nodeId)
  }

  const handleToggleLock = (nodeId: string) => {
    const node = blueprintNodes.find(n => n.id === nodeId)
    if (node) {
      updateBlueprintNode(nodeId, { locked: !node.locked })
    }
  }

  const handleRemoveNode = (nodeId: string) => {
    // Placeholder: remove node from blueprint
    console.log('Remove node:', nodeId)
  }

  const handleNodeChange = (nodeId: string, field: keyof any, value: any) => {
    updateBlueprintNode(nodeId, { [field]: value })
  }

  const handleNodeMaterialsChange = (nodeId: string, materials: any[]) => {
    updateBlueprintNode(nodeId, { materials })
  }

  const handleNodeFactToggle = (nodeId: string, materialId: string, factId: string) => {
    const node = blueprintNodes.find(n => n.id === nodeId)
    if (!node) return

    const newMaterials = node.materials.map(m => {
      if (m.id === materialId) {
        return {
          ...m,
          facts: m.facts.map(f => f.id === factId ? { ...f, enabled: !f.enabled } : f)
        }
      }
      return m
    })

    updateBlueprintNode(nodeId, { materials: newMaterials })
  }

  const handleParseMaterials = async (nodeId: string) => {
    const node = blueprintNodes.find(n => n.id === nodeId)
    if (!node) return

    const materialsToParse = node.materials.filter(m => m.name !== "节点解析结果" && m.name !== "解析结果提取")
    if (materialsToParse.length === 0 && !node.description) {
      toast.warning("无法解析", { description: "请先添加素材或填写节点描述" })
      return
    }

    setNodeParsingStatus(prev => ({ ...prev, [nodeId]: true }))

    try {
      const fileContents: string[] = []
      const fileNames: string[] = []
      const urls: string[] = []
      const urlNames: string[] = []

      for (const material of materialsToParse) {
        if (material.type === 'file' && material.file) {
          try {
            let text = ''
            if (material.file.name.toLowerCase().endsWith('.docx')) {
              const arrayBuffer = await material.file.arrayBuffer()
              const result = await mammoth.extractRawText({ arrayBuffer })
              text = result.value
            } else {
              text = await material.file.text()
            }
            fileContents.push(text)
            fileNames.push(material.name)
          } catch (error) {
            console.error(`Failed to read file ${material.name}:`, error)
          }
        } else if (material.type === 'url' && material.url) {
          urls.push(material.url)
          urlNames.push(material.name)
        }
      }

      const formData = new FormData()
      formData.append('prompt', node.title + "\n" + node.description) // Use node title/desc as prompt context
      // Node parsing doesn't need web search usually, unless we want to enhance it. Let's keep it simple for now.
      formData.append('searchEnabled', 'false')

      fileContents.forEach(content => formData.append('fileContents', content))
      fileNames.forEach(name => formData.append('fileNames', name))
      urls.forEach(url => formData.append('urls', url))
      urlNames.forEach(name => formData.append('urlNames', name))

      const result = await analyzeIntent(formData)

      if (result.success && result.data) {
        const { facts } = result.data

        // Deduplicate against existing node facts
        // Collect all existing facts in this node to prevent duplicates
        const existingFactStrings = node.materials.flatMap(m => m.facts).map(f => f.content)
        const dedupeResult = await deduplicateFacts(existingFactStrings, facts)
        const newFacts = dedupeResult.data || facts

        if (newFacts.length === 0) {
          toast.info("解析完成", { description: "未发现新的关键事实" })
        } else {
          const atomicFacts: AtomicFact[] = newFacts.map((fact: string, index: number) => ({
            id: `node-fact-${node.id}-${Date.now()}-${index}`,
            content: fact,
            source: "Node Analysis",
            enabled: true
          }))

          // Add to a special result material or merge? 
          // Let's create/update a "节点解析结果" material
          const resultMaterialId = `parsed-${node.id}`
          const existingResultMaterial = node.materials.find(m => m.name === "节点解析结果")

          let updatedMaterials = [...node.materials]

          if (existingResultMaterial) {
            updatedMaterials = updatedMaterials.map(m =>
              m.name === "节点解析结果"
                ? { ...m, facts: [...m.facts, ...atomicFacts] }
                : m
            )
          } else {
            const newMaterial: Material = {
              id: resultMaterialId,
              name: "节点解析结果",
              type: 'text', // Virtual type
              facts: atomicFacts,
              content: ''
            }
            updatedMaterials.push(newMaterial)
          }

          updateBlueprintNode(nodeId, { materials: updatedMaterials })
          setNodeParsedStatus(prev => ({ ...prev, [nodeId]: true }))
          toast.success("解析成功", { description: `提取了 ${atomicFacts.length} 个新知识点` })
        }
      } else {
        throw new Error(result.error || "解析失败")
      }

    } catch (error) {
      console.error("Node parse error:", error)
      toast.error("解析失败", { description: String(error) })
    } finally {
      setNodeParsingStatus(prev => ({ ...prev, [nodeId]: false }))
    }
  }

  const canParseNode = (node: any) => {
    return node.materials && node.materials.length > 0
  }

  const hasNodeFacts = (node: any) => {
    return node.materials && node.materials.some((m: any) => m.facts && m.facts.length > 0)
  }

  const handleRegenerateContent = async (nodeId: string) => {
    const node = blueprintNodes.find(n => n.id === nodeId)
    if (!node) return

    // Update generating state
    setGeneratingNodes(prev => new Set(prev).add(nodeId))
    setGeneratedContents(prev => ({
      ...prev,
      [nodeId]: { content: '', status: 'generating' as const }
    }))
    // Update node status in store
    updateBlueprintNode(nodeId, { status: 'generating', progress: 0 })

    try {
      const globalFacts = atomicFacts.filter(fact => fact.enabled).map(fact => fact.content)
      const localFacts = node.localFacts || []

      // Collect enabled facts from node-level materials
      const nodeMaterialFacts = node.materials.flatMap(m =>
        m.facts.filter(fact => fact.enabled).map(fact => fact.content)
      )

      // Get search enabled and form data state
      const { isSearchEnabled, formData } = useVibeWriteStore.getState()

      // Use local custom prompt if available
      const customPrompt = node.customInstruction

      // Call server action to generate content
      const result = await writeNodeContent(
        node.title,
        node.description,
        globalFacts,
        [...localFacts, ...nodeMaterialFacts], // Combine node-level localFacts and material facts
        formData, // Use actual form data for constraints (tone, audience)
        customPrompt, // Pass the custom instructions
        isSearchEnabled
      )

      if (result.success) {
        const content = result.data || ''
        setGeneratedContents(prev => ({
          ...prev,
          [nodeId]: { content, status: 'completed' as const }
        }))
        // Update node status in store
        updateBlueprintNode(nodeId, { status: 'completed', progress: 100, content })
      } else {
        const errorContent = result.error || '生成失败'
        setGeneratedContents(prev => ({
          ...prev,
          [nodeId]: { content: errorContent, status: 'error' as const }
        }))
        updateBlueprintNode(nodeId, { status: 'error', progress: 0 })
      }
    } catch (error) {
      console.error('Failed to generate content:', error)
      setGeneratedContents(prev => ({
        ...prev,
        [nodeId]: { content: '生成过程中发生错误', status: 'error' as const }
      }))
      updateBlueprintNode(nodeId, { status: 'error' })
    } finally {
      setGeneratingNodes(prev => {
        const next = new Set(prev)
        next.delete(nodeId)
        return next
      })
    }
  }

  // Auto-trigger generation when nodes are loaded and pending
  React.useEffect(() => {
    // Check if we have nodes, none are currently generating, and we satisfy "fresh" criteria (e.g., all pending)
    // Also trigger if shouldAutoGenerate is true
    const hasNodes = blueprintNodes.length > 0
    const hasPendingAndNoCompleted = blueprintNodes.some(n => n.status === 'pending') && !blueprintNodes.some(n => n.status === 'completed' || n.status === 'generating')
    const isNotGenerating = generatingNodes.size === 0

    if ((hasNodes && hasPendingAndNoCompleted && isNotGenerating) || (shouldAutoGenerate && hasNodes && isNotGenerating)) {
      console.log('Auto-triggering blueprint generation...')
      if (shouldAutoGenerate) {
        setShouldAutoGenerate(false)
      }
      handleGenerateAll()
    }
  }, [blueprintNodes, generatingNodes.size, shouldAutoGenerate])

  const handleGenerateAll = async () => {
    // Generate content for all nodes that are not completed
    const nodesToGenerate = blueprintNodes.filter(node => node.status !== 'completed')

    // We should probably run these in parallel or with a concurrency limit
    // For now, let's fire them all and let the state management handle optimistic updates
    nodesToGenerate.forEach(node => {
      handleRegenerateContent(node.id)
    })
  }

  // Calculate overall progress
  const totalNodes = blueprintNodes.length
  const completedNodes = blueprintNodes.filter(node => node.status === 'completed').length
  const progress = totalNodes > 0 ? (completedNodes / totalNodes) * 100 : 0

  const handleMergeAndAudit = async () => {
    // 1. Combine all node content
    const nodesWithContent = blueprintNodes.filter(node => node.status === 'completed')
    if (nodesWithContent.length === 0) {
      toast.warning("暂无已完成的节点内容，请先完成生成")
      return
    }

    const fullContentDraft = nodesWithContent
      .map(node => `## ${node.title}\n\n${node.content || ''}`)
      .join('\n\n')

    // 2. Update store with preliminary content and starting refining status
    setProductionResult({
      fullContent: fullContentDraft,
      isRefining: true,
      title: productionResult.title || intent || '未命名文档'
    })

    // 3. Navigate to Audit page
    setActiveFold2Page(1)

    // 4. Trigger Refinement
    let finalContent = fullContentDraft
    try {
      const globalFactTexts = atomicFacts.filter(f => f.enabled).map(f => f.content)
      const refineResult = await refineFullArticle(fullContentDraft, globalFactTexts, intent || '', formData)

      if (refineResult.success && refineResult.data) {
        finalContent = refineResult.data
        setProductionResult({
          fullContent: finalContent,
          isRefining: false,
          isAuditing: true
        })
        toast.info("已完成全文重写润色，正在进行事实审计...")
      } else {
        setProductionResult({ isRefining: false, isAuditing: true })
        toast.error("全文重写失败，将直接进入审计阶段", { description: refineResult.error })
      }
    } catch (error) {
      console.error('Refinement failed:', error)
      setProductionResult({ isRefining: false, isAuditing: true })
    }

    // 5. Trigger audit action
    try {
      const allFacts = atomicFacts.filter(fact => fact.enabled).map(fact => fact.content)
      const result = await auditContent(finalContent, allFacts, isSearchEnabled)

      if (result.success) {
        // V1.0 logic returns structured JSON array directly
        const rawResults = Array.isArray(result.data) ? result.data : []
        const finalAuditResults = rawResults.map((item, idx) => ({
          ...item,
          id: `audit-auto-${idx}-${Date.now()}`
        }))
        setProductionResult({ auditResults: finalAuditResults, isAuditing: false })
        toast.success("全文审计完成")
      } else {
        setProductionResult({ isAuditing: false })
        toast.error("全文审计失败", { description: result.error })
      }
    } catch (error) {
      console.error('Audit failed:', error)
      setProductionResult({ isAuditing: false })
      toast.error("审计过程中发生错误")
    }
  }

  /* Deep Edit Sidebar State */
  const [deepEditNodeId, setDeepEditNodeId] = React.useState<string | null>(null)

  const handleOpenDeepEdit = (nodeId: string) => {
    setDeepEditNodeId(nodeId)
  }

  const handleCloseDeepEdit = () => {
    setDeepEditNodeId(null)
  }

  /* ... existing handlers ... */

  // Find the node currently being deep edited
  const deepEditNode = deepEditNodeId ? blueprintNodes.find(n => n.id === deepEditNodeId) : null

  const handlePromptChange = (nodeId: string, prompt: string) => {
    updateBlueprintNode(nodeId, { customInstruction: prompt })
  }

  return (
    <div className="relative">
      <div className="space-y-6">
        {/* Header with progress */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
          </div>
        </div>

        {/* Progress bar */}
        {totalNodes > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>生成进度</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Nodes list */}
        {blueprintNodes.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blueprintNodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blueprintNodes.map((node, index) => (
                  <SortableBlueprintNode
                    key={node.id}
                    node={node}
                    index={index}
                    expandedNode={expandedNode}
                    setExpandedNode={setExpandedNode}
                    handleToggleLock={handleToggleLock}
                    handleRemoveNode={handleRemoveNode}
                    handleNodeChange={handleNodeChange}
                    generatedContent={generatedContents[node.id]}
                    isGeneratingOverall={generatingNodes.size > 0}
                    onOpenDeepEdit={handleOpenDeepEdit}
                    onRegenerateContent={handleRegenerateContent}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <Card className="p-8 text-center border-dashed">
            <div className="max-w-md mx-auto space-y-4">
              <div className="h-12 w-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                <ChevronRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <h4 className="font-semibold">{t('editor.emptyTitle')}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('editor.emptyDescription')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Fact connection info & Merge/Audit Button */}
        {blueprintNodes.length > 0 && blueprintNodes.every(n => n.status === 'completed') && (
          <div className="space-y-4">
            <Card className="p-4 bg-primary/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <span className="font-medium">{t('editor.constructionComplete')}</span>
                  <span className="text-muted-foreground ml-2">
                    {t('editor.nodesGenerated', { count: blueprintNodes.length.toString() })}
                  </span>
                </div>
                <div className="text-xs text-primary font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  {t('editor.readyForAudit')}
                </div>
              </div>
            </Card>

            <Button
              className="w-full gap-2 h-12 shadow-md font-medium text-base group"
              size="lg"
              onClick={handleMergeAndAudit}
            >
              <Shield className="h-4 w-4 transition-transform group-hover:scale-110" />
              {t('editor.mergeAndAuditButton')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        )}
      </div>

      {/* Deep Edit Sidebar Overlay */}
      {deepEditNode && (
        <div className="fixed inset-y-0 right-0 w-[400px] z-50 bg-background shadow-2xl border-l">
          <ChapterDeepEditSidebar
            node={deepEditNode}
            onClose={handleCloseDeepEdit}
            onNodeChange={handleNodeChange}
            onNodeMaterialsChange={handleNodeMaterialsChange}
            onNodeFactToggle={handleNodeFactToggle}
            handleParseMaterials={handleParseMaterials}
            nodeParsingStatus={nodeParsingStatus}
            nodeParsedStatus={nodeParsedStatus}
            onPromptChange={handlePromptChange}
            customPrompt={deepEditNode.customInstruction}
            isGeneratingOverall={generatingNodes.size > 0}
            onRegenerateContent={handleRegenerateContent}
            generatedContent={generatedContents[deepEditNode.id]}
          />
        </div>
      )}
    </div>
  )
}