"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import { useTranslation } from "@/lib/i18n"
import { ExportMenu } from "./export-menu"
import { MarkdownRenderer } from "./markdown-renderer"
import { auditContent, generateTitle } from "@/app/actions/production"
import { CheckCircle, AlertCircle, AlertTriangle, Info, Download, FileText, Shield, RefreshCw, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function AuditPanel() {
  const { t } = useTranslation()
  const {
    productionResult,
    blueprintNodes,
    atomicFacts,
    isSearchEnabled,
    setProductionResult,
    intent,
    syncHistory,
    formData,
  } = useVibeWriteStore()
  const isRefining = productionResult.isRefining
  const isAuditing = productionResult.isAuditing
  const auditResults = productionResult.auditResults
  const [isGeneratingTitle, setIsGeneratingTitle] = React.useState(false)

  const handleRunAudit = async () => {
    setProductionResult({ isAuditing: true })
    try {
      // 1. Ensure we have high-quality content
      let currentFullContent = productionResult.fullContent;

      const completedNodes = blueprintNodes.filter(node => node.status === 'completed')
      if (completedNodes.length === 0 && !currentFullContent) {
        toast.warning("暂无已完成的内容可审计")
        setProductionResult({ isAuditing: false })
        return
      }

      if (!currentFullContent) {
        currentFullContent = completedNodes
          .map(node => `## ${node.title}\n\n${node.content || ''}`)
          .join('\n\n')
        setProductionResult({ fullContent: currentFullContent })
      }

      const allFacts = atomicFacts.filter(fact => fact.enabled).map(fact => fact.content)

      // 2. Call audit server action
      const result = await auditContent(
        currentFullContent,
        allFacts,
        isSearchEnabled
      )

      if (result.success) {
        // V1.0 logic returns structured JSON array directly
        const rawResults = Array.isArray(result.data) ? result.data : []
        const finalAuditResults = rawResults.map((item: any, idx: number) => ({
          ...item,
          id: item.id || `audit-manual-${idx}-${Date.now()}`
        }))
        setProductionResult({ auditResults: finalAuditResults, isAuditing: false })
        toast.success(t('audit.toastSuccess'))
      } else {
        setProductionResult({ isAuditing: false })
        toast.error(t('audit.toastFailed'), { description: result.error })
      }
    } catch (error) {
      console.error('Audit failed:', error)
      setProductionResult({ isAuditing: false })
      toast.error(t('audit.toastError'))
    }
  }

  const handleGenerateTitle = async () => {
    if (!productionResult.fullContent) return

    setIsGeneratingTitle(true)
    try {
      const enabledFacts = atomicFacts.filter(f => f.enabled).map(f => f.content)
      const result = await generateTitle(
        productionResult.fullContent,
        intent,
        enabledFacts,
        formData
      )

      if (result.success && result.data) {
        setProductionResult({ title: result.data })
        syncHistory({ title: result.data })
        toast.success("标题已生成")
      } else {
        toast.error("标题生成失败")
      }
    } catch (error) {
      console.error('Title generation failed:', error)
      toast.error("标题生成过程中发生错误")
    } finally {
      setIsGeneratingTitle(false)
    }
  }

  // Auto-generate title if missing or default
  React.useEffect(() => {
    if (productionResult.fullContent && (!productionResult.title || productionResult.title === intent || productionResult.title === '未命名文档')) {
      handleGenerateTitle()
    }
  }, [productionResult.fullContent])



  const fullContent = productionResult.fullContent || t('audit.defaultPreview')

  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-6 items-start">
        {/* Left: Content Preview */}
        <Card className="flex flex-col overflow-hidden min-h-[600px]">
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div className="flex-1 min-w-0 mr-4">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold truncate">{productionResult.title || t('node.unnamed')}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full"
                  onClick={handleGenerateTitle}
                  disabled={isGeneratingTitle || isRefining}
                >
                  <RefreshCw className={cn("h-3 w-3", isGeneratingTitle && "animate-spin text-primary")} />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{t('audit.previewTitle')}</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              {isRefining ? (
                <>
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  {t('audit.statusRefining')}
                </>
              ) : isAuditing ? (
                <>
                  <Shield className="h-3 w-3 animate-pulse text-primary" />
                  {t('audit.statusAuditing')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  {t('audit.statusIntegrated')}
                </>
              )}
            </Badge>
          </div>

          <ScrollArea className="flex-1 p-4">
            <MarkdownRenderer content={fullContent} />
          </ScrollArea>
        </Card>

        {/* Right: Audit Report */}
        <Card className="flex flex-col overflow-hidden min-h-[600px]">
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
            <div>
              <h4 className="font-semibold">{t('audit.title')}</h4>
              <p className="text-sm text-muted-foreground">{t('audit.subtitle')}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRunAudit}
                disabled={isAuditing}
                className="h-8"
              >
                {isAuditing ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Shield className="h-3 w-3 mr-1" />
                )}
                {isAuditing ? t('audit.auditingButton') : t('audit.runButton')}
              </Button>
              {auditResults.length > 0 && (
                <Badge variant="secondary">
                  {auditResults.filter(r => r.type === 'passed').length} {t('audit.passedCount')}
                </Badge>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {auditResults.map((result, index) => (
                <div
                  key={result.id || `audit-${index}`}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg border
                    ${result.type === 'passed' ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800' : ''}
                    ${result.type === 'suggestion' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800' : ''}
                    ${result.type === 'risk' ? 'bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800' : ''}
                    ${result.type === 'anomaly' ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800' : ''}
                  `}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {result.type === 'passed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {result.type === 'suggestion' && <Info className="h-5 w-5 text-yellow-600" />}
                    {result.type === 'risk' && <AlertTriangle className="h-5 w-5 text-orange-600" />}
                    {result.type === 'anomaly' && <AlertCircle className="h-5 w-5 text-red-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h5 className="font-medium text-sm truncate">{result.title}</h5>
                      <Badge
                        variant="outline"
                        className={`
                          text-xs flex-shrink-0 ${result.type === 'passed' ? 'text-green-700 border-green-300' : ''}
                          ${result.type === 'suggestion' ? 'text-yellow-700 border-yellow-300' : ''}
                          ${result.type === 'risk' ? 'text-orange-700 border-orange-300' : ''}
                          ${result.type === 'anomaly' ? 'text-red-700 border-red-300' : ''}
                        `}
                      >
                        {result.type === 'passed' && t('audit.statusPassed')}
                        {result.type === 'suggestion' && t('audit.statusSuggestion')}
                        {result.type === 'risk' && t('audit.statusRisk')}
                        {result.type === 'anomaly' && t('audit.statusAnomaly')}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 break-words">{result.description}</p>
                  </div>
                </div>
              ))}

              {auditResults.length === 0 && !isAuditing && (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  {t('audit.noResults')}
                </div>
              )}
            </div>

            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4" />
                <p>{t('audit.disclaimer')}</p>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  )
}