"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { MaterialUploader } from "@/components/material-uploader"
import { AtomicFactsList } from "@/components/atomic-facts-list"
import { DynamicForm } from "@/components/dynamic-form"
import { ArrowRight, Sparkles, RefreshCw, Trash2, Globe } from "lucide-react"
import type { Material, AtomicFact } from "@/lib/types"
import { analyzeIntent, generateFormSchema, deduplicateFacts } from "@/app/actions/setup"
import { toast } from "sonner"
import * as mammoth from "mammoth"
import { cn } from "@/lib/utils"

interface SceneConfigurationProps {
  onNext: (data: any) => void
  initialData?: any
}

export function SceneConfiguration({ onNext, initialData }: SceneConfigurationProps) {
  const [intent, setIntent] = useState(initialData?.intent || "")
  const [materials, setMaterials] = useState<Material[]>(initialData?.materials || [])
  const [showFactSelection, setShowFactSelection] = useState(initialData?.showFactSelection || false)
  const [showDynamicForm, setShowDynamicForm] = useState(initialData?.showDynamicForm || false)
  const [formData, setFormData] = useState<Record<string, any>>(initialData?.formData || {})
  const [isParsed, setIsParsed] = useState(initialData?.isParsed || false)
  const [missingInfo, setMissingInfo] = useState<string[]>(initialData?.missingInfo || [])
  const [dynamicFields, setDynamicFields] = useState<any[]>(initialData?.dynamicFields || [])
  const [isParsing, setIsParsing] = useState(false)
  const [isGeneratingForm, setIsGeneratingForm] = useState(false)
  const [globalFacts, setGlobalFacts] = useState<AtomicFact[]>(initialData?.globalFacts || [])
  const [searchEnabled, setSearchEnabled] = useState(initialData?.searchEnabled || false)

  const handleParseMaterials = async () => {
    // Capture currently enabled (selected) facts to preserve them
    const preservedFacts: AtomicFact[] = [
      ...globalFacts.filter(f => f.enabled),
      ...materials.flatMap(m => m.facts.filter(f => f.enabled))
    ]

    setIsParsing(true)
    // Reset form state when re-parsing to allow generating a new one
    setShowDynamicForm(false)
    setDynamicFields([])
    setFormData({})

    // Read files on client side
    const fileContents: string[] = []
    const fileNames: string[] = []
    const urls: string[] = []
    const urlNames: string[] = []

    for (const material of materials) {
      if (material.type === 'file' && material.file) {
        try {
          let text = ''
          if (material.file.name.toLowerCase().endsWith('.docx')) {
            const arrayBuffer = await material.file.arrayBuffer()
            const result = await mammoth.extractRawText({ arrayBuffer })
            text = result.value
            console.log(`[Material] Extracted text from ${material.name}:`, text.substring(0, 100))
          } else {
            text = await material.file.text()
          }
          fileContents.push(text)
          fileNames.push(material.name)
        } catch (error) {
          console.error(`Failed to read file ${material.name}:`, error)
          fileContents.push('')
          fileNames.push(material.name)
        }
      } else if (material.type === 'url' && material.url) {
        urls.push(material.url)
        urlNames.push(material.name)
      }
    }

    // Prepare FormData with text content
    const setupFormData = new FormData()
    setupFormData.append('prompt', intent)
    setupFormData.append('searchEnabled', String(searchEnabled))

    fileContents.forEach(content => {
      setupFormData.append('fileContents', content)
    })
    fileNames.forEach(name => {
      setupFormData.append('fileNames', name)
    })
    urls.forEach(url => {
      setupFormData.append('urls', url)
    })
    urlNames.forEach(name => {
      setupFormData.append('urlNames', name)
    })

    const result = await analyzeIntent(setupFormData)

    if (result.success && result.data) {
      const { facts, missingInformation } = result.data

      if (facts.length === 0 && missingInformation.length === 0) {
        toast.info("解析结束，但未提取到有效事实", {
          description: "请尝试提供更详细的意图描述或检查素材内容。"
        })
      } else {
        // Check for failed URLs
        if (result.failedUrls && result.failedUrls.length > 0) {
          toast.warning("部分素材解析失败", {
            description: `以下链接无法访问：${result.failedUrls.join(", ")}`,
            duration: 5000,
          })
        } else {
          toast.success("素材解析成功")
        }
      }

      // 1. Deduplicate new facts against preserved ones
      const existingFactStrings = preservedFacts.map(f => f.content)
      const dedupeResult = await deduplicateFacts(existingFactStrings, facts)
      const nonRedundantFacts = dedupeResult.data || facts

      // 2. Create atomic fact objects for new ones
      const newAtomicFacts: AtomicFact[] = nonRedundantFacts.map((fact: string, index: number) => ({
        id: `fact-${Date.now()}-${index}`,
        content: fact,
        source: "AI Analysis",
        enabled: true
      }))

      // 3. Merge preserved with new non-redundant facts
      const finalFacts = [...preservedFacts, ...newAtomicFacts]

      // Distribution logic: If files exist, maybe we don't know which file these new facts belong to
      // For simplicity in re-parsing, we'll put merged facts into their relevant containers
      // or into global if no specific mapping is possible.
      if (materials.length > 0) {
        // If materials existed, we might have lost the specific mapping for the old ones
        // But since we captured them, we can try to re-distribute or just put all in first material/global
        setGlobalFacts(finalFacts)
        setMaterials(materials.map(m => ({ ...m, facts: [] }))) // Clear distributed facts to avoid confusion
      } else {
        setGlobalFacts(finalFacts)
      }

      setMissingInfo(missingInformation)
      setIsParsed(true)
      setShowFactSelection(true)
    } else {
      toast.error("解析失败", {
        description: result.error || "请检查网络连接或 API 配置",
      })
    }

    setIsParsing(false)
  }

  const handleFactToggle = (materialId: string, factId: string) => {
    // Handle global facts separately
    if (materialId === 'global') {
      setGlobalFacts(globalFacts.map(f =>
        f.id === factId ? { ...f, enabled: !f.enabled } : f
      ))
      return
    }

    // Handle material facts
    setMaterials(
      materials.map((material) => {
        if (material.id === materialId) {
          return {
            ...material,
            facts: material.facts.map((fact) => (fact.id === factId ? { ...fact, enabled: !fact.enabled } : fact)),
          }
        }
        return material
      }),
    )
  }

  const handleGenerateDynamicForm = async () => {
    setIsGeneratingForm(true)
    // Clear previous data to ensure a fresh start
    setDynamicFields([])
    setFormData({})

    // Collect selected facts content for context
    const selectedFactContents: string[] = []

    // Add enabled global facts
    globalFacts.filter(f => f.enabled).forEach(f => selectedFactContents.push(f.content))

    // Add enabled material facts
    materials.forEach(m => {
      m.facts.filter(f => f.enabled).forEach(f => selectedFactContents.push(f.content))
    })

    const result = await generateFormSchema(missingInfo, intent, selectedFactContents)

    if (result.success && result.data) {
      setDynamicFields(result.data)
      setShowDynamicForm(true)
      toast.success("已基于您的意图和选择重新生成配置选")
    }
    setIsGeneratingForm(false)
  }

  const handleFormComplete = (data: Record<string, any>) => {
    setFormData(data)
  }

  const handleClearAllFacts = () => {
    setGlobalFacts([])
    setMaterials(materials.map(m => ({ ...m, facts: [] })))
    setShowFactSelection(false)
    setIsParsed(false)
    setShowDynamicForm(false)
    setFormData({})
    toast.success("已清除所有解析的事实")
  }

  const handleNext = () => {
    // Collect selected facts from both materials and global facts
    const materialFacts = materials.flatMap((m) => m.facts.filter((f) => f.enabled).map((f) => f.id))
    const globalFactIds = globalFacts.filter(f => f.enabled).map(f => f.id)
    const selectedFacts = [...materialFacts, ...globalFactIds]

    onNext({
      intent,
      materials,
      globalFacts,
      selectedFacts,
      formData,
      isParsed,
      showFactSelection,
      showDynamicForm,
      missingInfo,
      dynamicFields,
      searchEnabled,
    })
  }

  const canProceed = (intent.trim() !== "" || materials.length > 0) && isParsed && showDynamicForm && Object.keys(formData).length > 0

  const canParse = intent.trim() !== "" || materials.length > 0
  const parseButtonText = intent && materials.length > 0 ? "解析写作意图和素材" : intent ? "解析写作意图" : "解析素材"

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-balance">场景自适应配置</h2>
        <p className="mt-2 text-muted-foreground">说明你的写作意图，也可以上传你的参考资料</p>
      </div>

      {/* Writing Intent and Materials */}
      <Card className="p-6">
        <div className="space-y-6">
          {/* Intent Input */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="intent" className="text-base font-medium">
                写作意图
              </Label>
              <p className="mt-1 text-sm text-muted-foreground">请描述您想要创建的内容类型和目标</p>
            </div>
            <Textarea
              id="intent"
              placeholder="例如:撰写一篇关于公司产品的市场分析报告,目标受众是潜在投资者..."
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Material Upload */}
          <div className="space-y-3">
            <div>
              <Label className="text-base font-medium">参考素材(可选)</Label>
              <p className="mt-1 text-sm text-muted-foreground">上传文件或粘贴链接作为写作参考资料</p>
            </div>

            <MaterialUploader materials={materials} onMaterialsChange={setMaterials} />
          </div>

          {/* Web Search Toggle */}
          <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">联网搜索 (Web Search)</p>
                <p className="text-xs text-muted-foreground">开启后将整合互联网相关搜索结果</p>
              </div>
            </div>
            <Switch
              checked={searchEnabled}
              onCheckedChange={setSearchEnabled}
              disabled={isParsing}
            />
          </div>

          {/* Parse Button */}
          {!isParsed ? (
            <Button
              onClick={() => {
                if (!intent.trim() && materials.length === 0) {
                  toast.warning("请输入写作意图", {
                    description: "写作意图或参考素材至少需要填写一项"
                  })
                  return
                }
                handleParseMaterials()
              }}
              className="w-full bg-transparent"
              variant="outline"
              disabled={isParsing}
            >
              {isParsing ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              {isParsing ? "正在解析中..." : parseButtonText}
            </Button>
          ) : (
            <Button
              onClick={handleParseMaterials}
              className="w-full bg-transparent"
              variant="outline"
              disabled={!canParse || isParsing}
            >
              <RefreshCw className={cn("mr-2 h-4 w-4", isParsing && "animate-spin")} />
              {isParsing ? "正在重新解析..." : "重新解析素材"}
            </Button>
          )}
        </div>
      </Card>

      {/* Atomic Facts Selection */}
      {showFactSelection && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">选择相关事实</Label>
                <p className="mt-1 text-sm text-muted-foreground">从写作意图和素材中解析的事实，点击切换启用状态</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAllFacts}
                className="h-8 text-muted-foreground hover:text-red-500 hover:bg-red-50"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                清除所有
              </Button>
            </div>

            {/* Display global facts if no files uploaded */}
            {globalFacts.length > 0 && (
              <AtomicFactsList materials={[{
                id: 'global',
                name: '从意图中提取的事实',
                type: 'file',
                facts: globalFacts
              }]} onFactToggle={handleFactToggle} />
            )}

            {/* Display material facts */}
            <AtomicFactsList materials={materials} onFactToggle={handleFactToggle} />

            {/* Combined Empty State */}
            {globalFacts.length === 0 && !materials.some(m => m.facts.length > 0) && (
              <div className="py-8 text-center border-2 border-dashed rounded-lg bg-muted/20">
                <p className="text-sm text-muted-foreground">未提取到事实，请尝试补充更多背景信息或检查素材内容。</p>
              </div>
            )}

            {!showDynamicForm && (
              <Button
                onClick={handleGenerateDynamicForm}
                className="w-full"
                disabled={isGeneratingForm}
              >
                {isGeneratingForm ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                {isGeneratingForm ? "正在分析意图并生成表单..." : "生成动态表单"}
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Dynamic Form */}
      {showDynamicForm && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">补全背景信息</Label>
                <p className="mt-1 text-sm text-muted-foreground">基于已选事实生成的定制化表单</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGenerateDynamicForm}
                disabled={isGeneratingForm}
                className="h-8 text-muted-foreground"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isGeneratingForm && "animate-spin")} />
                重新生成选项
              </Button>
            </div>

            {isGeneratingForm ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-lg bg-muted/20">
                <RefreshCw className="h-8 w-8 animate-spin text-primary/50" />
                <p className="text-sm text-muted-foreground">正在智能生成表单选项...</p>
              </div>
            ) : (
              <DynamicForm
                intent={intent}
                selectedFacts={materials}
                onComplete={handleFormComplete}
                fields={dynamicFields}
              />
            )}
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button onClick={handleNext} disabled={!canProceed} size="lg">
          下一步：生成框架
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
