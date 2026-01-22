"use client"

import * as React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import { useTranslation } from "@/lib/i18n"
import { Sparkles, Upload, Link2, FileText, Globe, CheckSquare, RefreshCw, ArrowRight, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { analyzeIntent, generateFormSchema } from "@/app/actions/setup"
// import { generateBlueprint } from "@/app/actions/blueprint" // Moved to ThreeColumnLayout
import { toast } from "sonner"
import * as mammoth from "mammoth"
import { DynamicForm } from "@/components/dynamic-form"

export function SceneConfigurationPanel() {
  const { t } = useTranslation()
  const {
    intent,
    setIntent,
    materials,
    addMaterial,
    removeMaterial,
    atomicFacts,
    toggleAtomicFact,
    setAtomicFacts,
    isSearchEnabled,
    formData,
    setFormData,
    selectedMaterialIds,
    setSelectedMaterialIds,
    missingInformation,
    setMissingInformation,
    dynamicFields,
    setDynamicFields,
    showFactSelection,
    setShowFactSelection,
    showDynamicForm,
    setShowDynamicForm,
  } = useVibeWriteStore()

  const [urlInput, setUrlInput] = React.useState("")
  const [isParsing, setIsParsing] = React.useState(false)
  const [isGeneratingForm, setIsGeneratingForm] = React.useState(false)

  // Helper to check if a material is selected
  // Store uses string[], converting to Set for easy lookup if needed, but array method includes is fine for small lists
  // or construct a Set once per render for efficiency if list is large.
  const selectedMaterialsSet = React.useMemo(() => new Set(selectedMaterialIds), [selectedMaterialIds])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach((file, index) => {
      const newMaterial = {
        id: `file-${Date.now()}-${index}`,
        type: "file" as const,
        name: file.name,
        file: file,
        facts: [],
        content: ""
      }
      addMaterial(newMaterial)
      // Select newly added material
      setSelectedMaterialIds([...selectedMaterialIds, newMaterial.id])
    })
  }

  const toggleMaterial = (id: string) => {
    if (selectedMaterialsSet.has(id)) {
      setSelectedMaterialIds(selectedMaterialIds.filter(mid => mid !== id))
    } else {
      setSelectedMaterialIds([...selectedMaterialIds, id])
    }
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    const newMaterial = {
      id: `url-${Date.now()}`,
      type: "url" as const,
      name: urlInput,
      url: urlInput,
      facts: [],
      content: ""
    }

    addMaterial(newMaterial)
    setSelectedMaterialIds([...selectedMaterialIds, newMaterial.id])
    setUrlInput("")
  }

  const handleParse = async () => {
    setIsParsing(true)

    try {
      // Prepare FormData
      const formData = new FormData()
      formData.append('prompt', intent)
      formData.append('searchEnabled', String(isSearchEnabled))

      const fileContents: string[] = []
      const fileNames: string[] = []
      const urls: string[] = []
      const urlNames: string[] = []

      // Only parse selected materials
      const materialsToParse = materials.filter(m => selectedMaterialsSet.has(m.id))

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
            fileContents.push('')
            fileNames.push(material.name)
          }
        } else if (material.type === 'url' && material.url) {
          urls.push(material.url)
          urlNames.push(material.name)
        }
      }

      fileContents.forEach(content => formData.append('fileContents', content))
      fileNames.forEach(name => formData.append('fileNames', name))
      urls.forEach(url => formData.append('urls', url))
      urlNames.forEach(name => formData.append('urlNames', name))

      // Call AI parsing
      const result = await analyzeIntent(formData)

      if (result.success && result.data) {
        const { facts, missingInformation } = result.data

        if (facts.length === 0 && missingInformation.length === 0) {
          toast.info("解析结束，但未提取到有效事实")
        } else {
          if (result.failedUrls && result.failedUrls.length > 0) {
            toast.warning("部分素材解析失败", {
              description: `以下链接无法访问：${result.failedUrls.join(", ")}`,
            })
          } else {
            toast.success("素材解析成功")
          }
        }

        // Create atomic fact objects
        const newAtomicFacts = facts.map((fact: string, index: number) => ({
          id: `fact-${Date.now()}-${index}`,
          content: fact,
          source: "AI Analysis",
          enabled: true
        }))

        // Update store
        setAtomicFacts([...atomicFacts, ...newAtomicFacts])
        setMissingInformation(missingInformation)
        setShowFactSelection(true)
      } else {
        toast.error("解析失败", { description: result.error })
      }
    } catch (error) {
      console.error('Parsing failed:', error)
      toast.error("解析过程中发生错误")
    } finally {
      setIsParsing(false)
    }
  }

  const handleGenerateForm = async () => {
    setIsGeneratingForm(true)
    try {
      // Prepare context: selected facts
      const selectedFacts = atomicFacts.filter(f => f.enabled).map(f => f.content)

      // Generate dynamic form schema based on missing information AND context
      const result = await generateFormSchema(missingInformation, intent, selectedFacts)

      if (result.success) {
        setDynamicFields(result.data || [])
        setShowDynamicForm(true)
        toast.success("已基于您的意图和选择生成动态表单")
      } else {
        toast.error("表单生成失败", { description: result.error })
      }
    } catch (error) {
      console.error('Form generation failed:', error)
      toast.error("表单生成过程中发生错误")
    } finally {
      setIsGeneratingForm(false)
    }
  }

  const handleFormComplete = (data: Record<string, any>) => {
    setFormData(data)
  }

  const handleRegenerateForm = async () => {
    setIsGeneratingForm(true)
    try {
      const selectedFacts = atomicFacts.filter(f => f.enabled).map(f => f.content)
      const result = await generateFormSchema(missingInformation, intent, selectedFacts)

      if (result.success) {
        setDynamicFields(result.data || [])
        toast.success("已基于您的意图和选择重新生成表单")
      } else {
        toast.error("表单重新生成失败", { description: result.error })
      }
    } catch (error) {
      console.error('Form regeneration failed:', error)
      toast.error("表单重新生成过程中发生错误")
    } finally {
      setIsGeneratingForm(false)
    }
  }

  const canParse = intent.trim() !== "" || selectedMaterialIds.length > 0

  const handleClearFacts = () => {
    setAtomicFacts([])
    setShowFactSelection(false)
    setShowDynamicForm(false)
    setMissingInformation([])
    setDynamicFields([])
    toast.info("已清除所有核心主题")
  }

  // handleGenerateBlueprint logic moved to ThreeColumnLayout

  return (
    <div className="space-y-6 min-w-0 w-full">
      {/* Intent Input */}
      <Card className="p-4 w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="space-y-4">
          <div>
            <Label htmlFor="intent" className="text-base font-medium">
              {t('config.intentTitle')}
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('config.intentDescription')}
            </p>
          </div>
          <Textarea
            id="intent"
            placeholder={t('config.intentPlaceholder')}
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            rows={4}
            className="resize-none w-full min-w-0"
          />
        </div>
      </Card>

      {/* Material Upload */}
      <Card className="p-4 w-full min-w-0 max-w-full overflow-x-hidden">
        <div className="space-y-4 w-full min-w-0">
          <div>
            <Label className="text-base font-medium">{t('config.materialTitle')}</Label>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('config.materialDescription')}
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={t('config.urlPlaceholder')}
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUrlAdd()}
                className="w-full"
              />
              <Button onClick={handleUrlAdd} disabled={!urlInput.trim()}>
                {t('config.addButton')}
              </Button>
            </div>

            <div className="relative">
              <Button variant="outline" className="w-full relative" asChild>
                <label>
                  <Upload className="mr-2 h-4 w-4" />
                  {t('config.uploadButton')}
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,.txt,.md"
                  />
                </label>
              </Button>
            </div>

            {materials.length > 0 && (
              <div className="w-full min-w-0 grid grid-cols-1 overflow-hidden">
                <ScrollArea className="max-h-60 w-full rounded border">
                  <div className="p-2 space-y-1 w-full min-w-0">
                    {materials.map(material => (
                      <div
                        key={material.id}
                        className="grid grid-cols-[minmax(0,1fr)_28px] items-center gap-2 p-2 rounded hover:bg-muted/50 w-full"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {material.type === 'url' ? (
                            <Globe className="h-4 w-4 text-blue-500 flex-shrink-0" />
                          ) : (
                            <FileText className="h-4 w-4 text-orange-500 flex-shrink-0" />
                          )}
                          <span
                            className="text-sm truncate block flex-1"
                            title={material.name}
                          >
                            {material.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeMaterial(material.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Parse Button */}
      <Button
        onClick={handleParse}
        className="w-full"
        disabled={isParsing || (!intent.trim() && materials.length === 0)}
        variant={showFactSelection ? "outline" : "default"}
      >
        {isParsing ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {isParsing ? "正在解析中..." : "解析写作意图和素材"}
      </Button>

      {/* Atomic Facts Selection */}
      {showFactSelection && (
        <Card className="p-4 w-full min-w-0 max-w-full overflow-x-hidden">
          <div className="space-y-4 w-full min-w-0">
            <div className="flex items-center justify-between w-full">
              <div>
                <Label className="text-base font-medium">选择核心主题</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  从写作意图和素材中解析的主题点，点击切换启用状态
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFacts}
                className="text-muted-foreground hover:text-destructive"
              >
                清除所有
              </Button>
            </div>

            <div className="space-y-2 w-full overflow-hidden">
              {atomicFacts.length > 0 ? (
                atomicFacts.map(fact => (
                  <div
                    key={fact.id}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors w-full min-w-0 overflow-hidden",
                      fact.enabled
                        ? "bg-primary/5 border-primary/30"
                        : "bg-muted/30 border-border"
                    )}
                    onClick={() => toggleAtomicFact(fact.id)}
                  >
                    <div className={cn(
                      "mt-0.5 flex items-center justify-center h-5 w-5 rounded border",
                      fact.enabled
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    )}>
                      {fact.enabled && <CheckSquare className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm break-words whitespace-pre-wrap">{fact.content}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{fact.source}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    暂无解析到的事实，请尝试补充更多背景信息
                  </p>
                </div>
              )}
            </div>

            {!showDynamicForm && (
              <Button onClick={handleGenerateForm} className="w-full" disabled={isGeneratingForm}>
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

      {/* Dynamic Form Placeholder */}
      {showDynamicForm && (
        <Card className="p-4 w-full min-w-0 overflow-hidden">
          <div className="space-y-4 w-full min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-medium">补全背景信息</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  基于已选事实生成的定制化表单
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRegenerateForm}
                disabled={isGeneratingForm}
                className="h-8 text-muted-foreground"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isGeneratingForm && "animate-spin")} />
                {isGeneratingForm ? "生成中..." : "重新生成"}
              </Button>
            </div>

            <div className="space-y-3">
              {isGeneratingForm ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed rounded-lg bg-muted/20">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary/50" />
                  <p className="text-sm text-muted-foreground">正在智能生成表单选项...</p>
                </div>
              ) : (
                <DynamicForm
                  intent={intent}
                  selectedFacts={materials} // Pass materials to satisfy the interface, though generation context is handled in the action
                  onComplete={handleFormComplete}
                  fields={dynamicFields}
                />
              )}
            </div>


          </div>
        </Card>
      )}

      {/* Persistent Generate Button - MOVED TO THREE COLUMN LAYOUT */}
      {/* 
      <Button
        className="w-full"
        onClick={handleGenerateBlueprint}
        disabled={isGeneratingBlueprint || !showDynamicForm} // Only enable when form is ready (step-by-step flow)
        size="lg"
      >
        {isGeneratingBlueprint ? (
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-4 w-4" />
        )}
        {isGeneratingBlueprint ? "正在生成..." : "生成"}
      </Button> 
      */}
    </div>
  )
}