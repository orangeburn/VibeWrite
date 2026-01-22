"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Download, FileText, AlertTriangle, CheckCircle2, Sparkles, Globe, X, RefreshCw, Loader2, Check, AlertCircle } from "lucide-react"
import { Switch } from "@/components/ui/switch"

import { integrateNode, auditContent, generateTitle } from "@/app/actions/production"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import type { Material } from "@/lib/types"
import { useTranslation } from "@/lib/i18n"

interface IntegrationAuditProps {
  productionData: any
  blueprintData: any
  globalContext: any
  onBack: () => void
}

export function IntegrationAudit({ productionData, blueprintData, globalContext, onBack }: IntegrationAuditProps) {
  const { t } = useTranslation()
  const { productionResult, setProductionResult, syncHistory } = useVibeWriteStore()
  const [isIntegrating, setIsIntegrating] = useState(false)
  const [integratedContent, setIntegratedContent] = useState(productionResult.fullContent || "")
  const [auditResults, setAuditResults] = useState<any[]>(productionResult.auditResults || [])
  const [isCompleted, setIsCompleted] = useState(!!productionResult.fullContent)
  const [articleTitle, setArticleTitle] = useState(productionResult.title || "")
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false)
  const [useSearch, setUseSearch] = useState(true)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  // Extract global facts for audit
  const allMaterials = globalContext.materials as Material[]
  const globalFacts = allMaterials
    .flatMap(m => m.facts)
    .filter(f => globalContext.selectedFacts.includes(f.id))
    .map(f => f.content)



  const handleStartIntegration = async () => {
    setIsIntegrating(true)

    let currentIntegratedText = ""

    // 1. Sequential Integration (Simulated "Rolling Window" via loop)
    // Real implementation: We iterate and call `integrateNode` to smooth transitions.
    // For MVP efficiency: We will iterate, but maybe we just concat if integrity check passes?
    // Let's call `integrateNode` for each node after the first one.

    for (let i = 0; i < productionData.nodes.length; i++) {
      const node = productionData.nodes[i]
      const contentObj = productionData.contents.find((c: any) => c.nodeId === node.id)
      const content = contentObj ? contentObj.content : ""

      let finalNodeText = content

      if (i > 0) {
        // Integrate with previous context
        const result = await integrateNode(currentIntegratedText, content, node.title)
        if (result.success && result.data) {
          finalNodeText = result.data
        }
      }

      currentIntegratedText += `\n\n## ${node.title}\n\n${finalNodeText}`
    }

    setIntegratedContent(currentIntegratedText)

    // 2. Global Audit with search capability
    const auditResult = await auditContent(currentIntegratedText, globalFacts, useSearch)

    // Parse audit result (assuming it returns some text analysis, we mock the structured items based on text for MVP or display raw)
    // The server action returns a text string. We can display it or try to parse if we structured it.
    // For MVP, let's just show the text output in a "General Audit" section or try to regex it.
    // Let's assume the server action prompted for "PASSED" or issues.

    const auditText = auditResult.data || "Audit failed or returned empty."

    // Simple parsing logic for MVP visualization
    const mockAuditResults = [
      {
        id: "audit-1",
        type: auditText.includes("PASSED") ? "success" : "warning",
        message: "全局一致性与幻觉检查",
        description: auditText,
      }
    ]

    setAuditResults(mockAuditResults)

    // 3. Generate Title
    setIsGeneratingTitle(true)
    const titleResult = await generateTitle(
      currentIntegratedText,
      globalContext.intent,
      globalFacts,
      globalContext.formData
    )
    if (titleResult.success && titleResult.data) {
      const generatedTitle = titleResult.data
      setArticleTitle(generatedTitle)
      // Sync to global store
      setProductionResult({
        title: generatedTitle,
        fullContent: currentIntegratedText,
        auditResults: mockAuditResults
      })
      // Also update History Document Title
      syncHistory({ title: generatedTitle })
    }
    setIsGeneratingTitle(false)

    setIsIntegrating(false)
    setIsCompleted(true)
  }

  const handleRegenerateTitle = async () => {
    setIsGeneratingTitle(true)
    const titleResult = await generateTitle(
      integratedContent,
      globalContext.intent,
      globalFacts,
      globalContext.formData
    )
    if (titleResult.success && titleResult.data) {
      const generatedTitle = titleResult.data
      setArticleTitle(generatedTitle)
      // Sync to global store
      setProductionResult({ title: generatedTitle })
      // Also update History Document Title
      syncHistory({ title: generatedTitle })
    }
    setIsGeneratingTitle(false)
  }

  const handleExport = (format: string) => {
    // Simulate export
    const contentToExport = `# ${articleTitle}\n\n${integratedContent}`
    const blob = new Blob([contentToExport], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${articleTitle || 'deep-write-output'}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!hasMounted) return null

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-2xl font-semibold text-balance">{t('integrationAuditTitle')}</h2>
        <p className="mt-2 text-muted-foreground">{t('integrationAuditDescription')}</p>
      </div>

      {/* Integration Status */}
      {!isCompleted && (
        <Card className="p-6">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <h3 className="font-medium">{t('integrationStartTitle')}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('integrationStartDescription')}
              </p>
            </div>
            <div className="flex flex-col items-end gap-4">
              <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-1.5 shadow-sm">
                <Globe className={`h-4 w-4 ${useSearch ? "text-primary" : "text-muted-foreground"}`} />
                <Label htmlFor="audit-search-toggle" className="text-sm font-medium cursor-pointer whitespace-nowrap">
                  {t('networkStatus.online')}
                </Label>
                <Switch
                  id="audit-search-toggle"
                  checked={useSearch}
                  onCheckedChange={setUseSearch}
                />
              </div>
              <Button onClick={handleStartIntegration} disabled={isIntegrating} className="w-full">
                {isIntegrating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    {t('integrationInProgress')}
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {t('fullIntegration')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Results */}
      {isCompleted && (
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="content">{t('contentTab')}</TabsTrigger>
            <TabsTrigger value="audit">{t('auditTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{t('finalContentTitle')}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{t('finalContentDescription')}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleExport("md")} variant="outline" size="sm" className="bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      Markdown
                    </Button>
                    <Button onClick={() => handleExport("txt")} variant="outline" size="sm" className="bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      TXT
                    </Button>
                    <Button onClick={() => handleExport("pdf")} variant="outline" size="sm" className="bg-transparent">
                      <Download className="mr-2 h-4 w-4" />
                      PDF
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">{t('generatedArticleTitle')}</Label>
                        {isGeneratingTitle ? (
                          <div className="h-7 w-2/3 animate-pulse rounded bg-muted-foreground/20 mt-1" />
                        ) : (
                          <h4 className="text-lg font-bold mt-1">{articleTitle || t('noTitleGenerated')}</h4>
                        )}
                      </div>
                      <Button
                        onClick={handleRegenerateTitle}
                        variant="ghost"
                        size="sm"
                        disabled={isGeneratingTitle}
                        className="h-8 gap-1 text-xs"
                      >
                        <Sparkles className="h-3 w-3" />
                        {t('regenerateTitleButton')}
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-[600px] overflow-y-auto rounded-lg border border-border bg-muted/30 p-6">
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                      {integratedContent}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">{t('auditReportTitle')}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t('auditReportDescription')}</p>
                </div>

                <div className="space-y-3">
                  {auditResults.map((result, index) => (
                    <Card key={result.id || `audit-${index}`} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {result.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          {result.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                          {result.type === "error" && <AlertTriangle className="h-5 w-5 text-red-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{result.message}</h4>
                            <Badge variant={result.type === "success" ? "default" : "secondary"} className="text-xs">
                              {result.type === "success" ? t('auditPassed') : t('auditSuggestion')}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">{result.description}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between gap-3">
        <Button onClick={onBack} variant="outline" size="lg" className="bg-transparent" disabled={isIntegrating}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('backButton')}
        </Button>
        {isCompleted && (
          <Button size="lg" className="gap-2">
            <FileText className="h-4 w-4" />
            {t('createNewProject')}
          </Button>
        )}
      </div>
    </div>
  )
}
