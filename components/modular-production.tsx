"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowRight, ArrowLeft, Sparkles, CheckCircle2, Clock, AlertCircle, Globe } from "lucide-react"
import type { GeneratedContent, Material, AtomicFact } from "@/lib/types"
import { writeNodeContent } from "@/app/actions/production"

interface ModularProductionProps {
  blueprintData: any
  globalContext: any
  initialData?: any
  onNext: (data: any) => void
  onBack: () => void
}

export function ModularProduction({ blueprintData, globalContext, initialData, onNext, onBack }: ModularProductionProps) {
  const [contents, setContents] = useState<GeneratedContent[]>(() => {
    if (initialData?.contents) return initialData.contents
    return blueprintData.nodes.map((node: any) => ({
      nodeId: node.id,
      content: "",
      status: "pending",
    }))
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGenerating, setCurrentGenerating] = useState<string | null>(null)
  const [nodePrompts, setNodePrompts] = useState<Record<string, string>>(() => {
    return initialData?.nodePrompts || {}
  })
  const [useSearch, setUseSearch] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Synchronize contents and prompts if nodes change
  useEffect(() => {
    setContents((currentContents) => {
      // Map current nodes to contents, preserving existing data if available
      return blueprintData.nodes.map((node: any) => {
        const existing = currentContents.find((c) => c.nodeId === node.id)
        if (existing) return existing
        return {
          nodeId: node.id,
          content: "",
          status: "pending",
        }
      })
    })

    setNodePrompts((currentPrompts) => {
      const newPrompts: Record<string, string> = {}
      blueprintData.nodes.forEach((node: any) => {
        if (currentPrompts[node.id]) {
          newPrompts[node.id] = currentPrompts[node.id]
        }
      })
      return newPrompts
    })
  }, [blueprintData.nodes])

  const handleStartGeneration = async () => {
    setIsGenerating(true)

    // Sequential generation
    for (let i = 0; i < blueprintData.nodes.length; i++) {
      const node = blueprintData.nodes[i]
      setCurrentGenerating(node.id)

      // Update status to generating
      setContents((prev) => prev.map((c) => (c.nodeId === node.id ? { ...c, status: "generating" } : c)))

      // Prepare context
      const allMaterials = globalContext.materials as Material[]
      const globalFacts = allMaterials
        .flatMap(m => m.facts)
        .filter(f => globalContext.selectedFacts.includes(f.id)) // Assuming selectedFacts is array of IDs
        .map(f => f.content)

      // Node local facts - extract from node materials
      const nodeMaterials = node.materials || []
      const localFacts = nodeMaterials
        .flatMap((m: Material) => m.facts)
        .filter((f: AtomicFact) => f.enabled)
        .map((f: AtomicFact) => f.content)

      // Call server action with independent search enabled
      const result = await writeNodeContent(
        node.title,
        node.description,
        globalFacts,
        localFacts,
        globalContext.formData,
        nodePrompts[node.id],
        useSearch // Use the state value
      )

      if (result.success && result.data) {
        setContents((prev) =>
          prev.map((c) => (c.nodeId === node.id ? { ...c, content: result.data, status: "completed" } : c)),
        )
      } else {
        setContents((prev) =>
          prev.map((c) => (c.nodeId === node.id ? { ...c, content: "生成失败，请重试", status: "error" } : c)),
        )
      }
    }

    setCurrentGenerating(null)
    setIsGenerating(false)
  }

  const handleRegenerateNode = async (nodeId: string) => {
    setCurrentGenerating(nodeId)
    setContents((prev) => prev.map((c) => (c.nodeId === nodeId ? { ...c, status: "generating" } : c)))

    const node = blueprintData.nodes.find((n: any) => n.id === nodeId)

    // Prepare context
    const allMaterials = globalContext.materials as Material[]
    const globalFacts = allMaterials
      .flatMap(m => m.facts)
      .filter(f => globalContext.selectedFacts.includes(f.id))
      .map(f => f.content)

    const nodeMaterials = node.materials || []
    const localFacts = nodeMaterials
      .flatMap((m: Material) => m.facts)
      .filter((f: AtomicFact) => f.enabled)
      .map((f: AtomicFact) => f.content)

    // Call server action with independent search enabled
    const result = await writeNodeContent(
      node.title,
      node.description,
      globalFacts,
      localFacts,
      globalContext.formData,
      nodePrompts[nodeId],
      useSearch // Use the state value
    )

    if (result.success && result.data) {
      setContents((prev) =>
        prev.map((c) => (c.nodeId === nodeId ? { ...c, content: result.data, status: "completed" } : c)),
      )
    } else {
      setContents((prev) =>
        prev.map((c) => (c.nodeId === nodeId ? { ...c, content: "生成失败", status: "error" } : c)),
      )
    }

    setCurrentGenerating(null)
  }

  const canProceed = blueprintData.nodes.length > 0 && blueprintData.nodes.every((node: any) => {
    const content = contents.find((c) => c.nodeId === node.id)
    return content?.status === "completed"
  })

  if (!hasMounted) return null

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-balance">模块化生产</h2>
          <p className="mt-2 text-muted-foreground">独立子代理并行生成各节点内容，确保逻辑隔离和质量稳定</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border bg-background px-4 py-2 shadow-sm">
          <Globe className={`h-4 w-4 ${useSearch ? "text-primary" : "text-muted-foreground"}`} />
          <Label htmlFor="search-toggle" className="text-sm font-medium cursor-pointer">
            联网搜索增强
          </Label>
          <Switch
            id="search-toggle"
            checked={useSearch}
            onCheckedChange={setUseSearch}
          />
        </div>
      </div>

      {/* Progress Card */}
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">生成进度</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {contents.filter((c) => c.status === "completed").length} / {blueprintData.nodes.length} 个节点已完成
              </p>
            </div>
            {!isGenerating && contents.filter((c) => c.status === "completed").length === 0 && (
              <Button onClick={handleStartGeneration}>
                <Sparkles className="mr-2 h-4 w-4" />
                开始生成
              </Button>
            )}
          </div>
          <Progress value={blueprintData.nodes.length > 0 ? (contents.filter((c) => c.status === "completed").length / blueprintData.nodes.length) * 100 : 0} className="h-2" />
        </div>
      </Card>

      {/* Content Nodes */}
      <div className="space-y-4">
        {blueprintData.nodes.map((node: any, index: number) => {
          const content = contents.find((c) => c.nodeId === node.id)
          const status = content?.status || "pending"

          return (
            <Card key={node.id} className="overflow-hidden">
              <div className="flex items-start gap-4 border-b border-border bg-muted/30 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-accent/10 text-sm font-semibold text-accent-foreground">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{node.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{node.description}</p>
                </div>
                <div>
                  {status === "pending" && (
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      等待中
                    </Badge>
                  )}
                  {status === "generating" && (
                    <Badge variant="default" className="gap-1">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      生成中
                    </Badge>
                  )}
                  {status === "completed" && (
                    <Badge variant="default" className="gap-1 bg-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      已完成
                    </Badge>
                  )}
                  {status === "error" && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      失败
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-4">
                {content?.content && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                      {content.content}
                    </pre>
                  </div>
                )}

                {!isGenerating && status !== "generating" && (
                  <>
                    {(status === "completed" || status === "error") && (
                      <div className="space-y-2">
                        <Label htmlFor={`prompt-${node.id}`} className="text-xs text-muted-foreground">
                          自定义生成指令 (可选)
                        </Label>
                        <Textarea
                          id={`prompt-${node.id}`}
                          placeholder="输入特定指令，例如：'强调技术创新' 或 '改为更通俗的表述'..."
                          value={nodePrompts[node.id] || ""}
                          onChange={(e) => setNodePrompts({ ...nodePrompts, [node.id]: e.target.value })}
                          rows={2}
                          className="min-h-[60px] resize-none bg-background/50"
                          disabled={currentGenerating === node.id}
                        />
                      </div>
                    )}

                    <Button
                      onClick={() => handleRegenerateNode(node.id)}
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      disabled={currentGenerating === node.id}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      {currentGenerating === node.id ? "生成中..." : status === "completed" ? "重新生成" : status === "error" ? "重试" : "开始生成"}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="bg-transparent" disabled={isGenerating}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button onClick={() => onNext({ contents, nodePrompts, nodes: blueprintData.nodes })} disabled={!canProceed} size="lg">
          下一步：整合审计
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
