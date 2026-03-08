"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import { GlobalSidebar } from "./global-sidebar"
import { SceneConfigurationPanel } from "./scene-configuration-panel"
import { BlueprintEditor } from "./blueprint-editor"
import { AuditPanel } from "./audit-panel"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen, PanelLeft, Moon, Sun, Globe, Github } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useTranslation } from "@/lib/i18n"
import { useTheme } from "next-themes"
import { LanguageSwitcher } from "@/components/language-switcher"
import { generateBlueprint } from "@/app/actions/blueprint"
import { toast } from "sonner"
import { RefreshCw, Sparkles, FileText, File, FileCode, Download } from "lucide-react"
import { exportFile } from "@/lib/export-utils"

interface ThreeColumnLayoutProps {
  children?: React.ReactNode
}

export function ThreeColumnLayout({ children }: ThreeColumnLayoutProps) {
  const { t } = useTranslation()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const {
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    activeFold2Page,
    setActiveFold2Page,
    isSearchEnabled,
    setSearchEnabled,
    formData,
    atomicFacts,
    materials,
    intent,
    isGeneratingBlueprint,
    setIsGeneratingBlueprint,
    setShouldAutoGenerate,
    hasGeneratedBlueprint,
    setHasGeneratedBlueprint,
    selectedMaterialIds,
  } = useVibeWriteStore()

  const handleGenerateBlueprint = async () => {
    setIsGeneratingBlueprint(true)
    try {
      // Record to history
      const historyTitle = intent.trim()
        ? (intent.split('\n')[0].length > 20 ? intent.split('\n')[0].substring(0, 20) + '...' : intent.split('\n')[0])
        : t('unnamedArticle')

      const currentDocSnapshot = {
        title: historyTitle,
        intent: intent,
        materials: materials,
        facts: atomicFacts,
        blueprintNodes: useVibeWriteStore.getState().blueprintNodes,
        productionResult: useVibeWriteStore.getState().productionResult,
        missingInformation: useVibeWriteStore.getState().missingInformation,
        dynamicFields: useVibeWriteStore.getState().dynamicFields,
        showFactSelection: useVibeWriteStore.getState().showFactSelection,
        showDynamicForm: useVibeWriteStore.getState().showDynamicForm,
        activeFold2Page: useVibeWriteStore.getState().activeFold2Page,
        formData: useVibeWriteStore.getState().formData,
        selectedMaterialIds: useVibeWriteStore.getState().selectedMaterialIds,
        hasGeneratedBlueprint: useVibeWriteStore.getState().hasGeneratedBlueprint,
      }
      useVibeWriteStore.getState().addHistoryDocument(currentDocSnapshot)

      const enabledFacts = atomicFacts.filter(fact => fact.enabled).map(fact => fact.content)

      // Prepare user answers from form data
      const userAnswers = {
        ...formData,
        intent: intent,
        language: useVibeWriteStore.getState().language
      }

      // Filter by selectedMaterialIds
      const materialsForBlueprint = materials
        .filter(m => useVibeWriteStore.getState().selectedMaterialIds.includes(m.id))
        .map(material => {
          if (material.type === 'file' && material.file) {
            // We need content. If it wasn't parsed/extracted yet, we might have an issue.
            // The original code passed `material.content` which was populated.
            // Let's assume `materials` in store has the content if it was parsed.
            return {
              name: material.name,
              content: material.content || ""
            }
          } else if (material.type === 'url' && material.url) {
            return {
              name: material.name,
              content: ""
            }
          }
          return { name: material.name, content: "" }
        })
        .filter(m => m.name)

      // Call blueprint generation
      const result = await generateBlueprint(
        enabledFacts,
        userAnswers,
        isSearchEnabled,
        [] // lockedNodes (empty for now)
      )

      if (result.success && result.data) {
        // Convert blueprint nodes to VibeWriteBlueprintNode format
        const blueprintNodes = result.data.map((node: any, index: number) => ({
          id: `node-${Date.now()}-${index}`,
          title: node.title,
          description: node.description,
          order: index,
          status: 'pending' as const,
          needsUpdate: false,
          locked: false,
          estimatedWordCount: node.estimatedWordCount || 0,
          materials: [],
          facts: [],
          localFacts: [],
          content: undefined
        }))

        // Update store with blueprint nodes
        useVibeWriteStore.getState().setBlueprintNodes(blueprintNodes)

        // Switch to blueprint tab
        useVibeWriteStore.getState().setActiveFold2Page(0)

        // Update history with the generated nodes
        const currentId = useVibeWriteStore.getState().currentDocumentId
        if (currentId) {
          useVibeWriteStore.getState().updateHistoryDocument(currentId, {
            blueprintNodes: blueprintNodes
          })
        }

        // Trigger auto-generation
        setShouldAutoGenerate(true)
        setHasGeneratedBlueprint(true)

        toast.success("蓝图生成成功")
      } else {
        toast.error("蓝图生成失败", { description: result.error })
      }
    } catch (error) {
      console.error('Blueprint generation failed:', error)
      toast.error(t('toast.blueprintError'))
    } finally {
      setIsGeneratingBlueprint(false)
    }
  }

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background flex-col">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-3">
          <PanelLeft className="h-5 w-5 text-muted-foreground" />
          <h1 className="text-lg font-semibold tracking-tight">{t('appName')}</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* GitHub Link */}
          <Button
            asChild
            variant="ghost"
            size="icon"
            title="GitHub"
          >
            <a
              href="https://github.com/orangeburn/VibeWrite"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <Github className="h-4 w-4" />
            </a>
          </Button>

          {/* Network Toggle Button (matches theme toggle style) */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchEnabled(!isSearchEnabled)}
            className="relative"
            title={isSearchEnabled ? t('networkStatus.online') : t('networkStatus.offline')}
          >
            <Globe className={cn("h-4 w-4 transition-colors", isSearchEnabled ? "text-primary" : "text-muted-foreground")} />
            {isSearchEnabled && (
              <span className="absolute top-2 right-2 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            )}
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Theme Toggle */}
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <TooltipProvider>
          <div className="flex h-full overflow-hidden bg-background w-full">
            {/* Column 0: Global Sidebar */}
            <div
              className={cn(
                "flex flex-col border-r bg-sidebar transition-all duration-300 ease-in-out overflow-hidden flex-shrink-0 h-full",
                isSidebarCollapsed ? "w-16" : "w-60"
              )}
            >
              <GlobalSidebar isCollapsed={isSidebarCollapsed} />
            </div>

            {/* Column 1: Configuration Panel */}
            <div className="flex flex-col border-r bg-background w-[400px] min-w-[320px] max-w-[400px] flex-shrink-0 overflow-x-hidden h-full">
              {/* Column 1 Header */}
              <div className="flex items-center p-4 border-b flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <h2 className="font-semibold text-sm">{t('column1.title')}</h2>
                </div>
              </div>

              {/* Column 1 Content */}
              <div className="flex-1 min-h-0 w-full relative min-w-0">
                <ScrollArea className="h-full w-full min-w-0 [&_[data-radix-scroll-area-viewport]]:h-full">
                  <div className="p-4 pb-10">
                    <SceneConfigurationPanel />
                  </div>
                </ScrollArea>
              </div>

              <div className="p-4 border-t flex items-center justify-center flex-shrink-0 bg-background z-10">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (!intent.trim() && materials.length === 0) {
                      toast.warning(t('toast.intentRequired'), {
                        description: t('toast.intentMaterialRequired')
                      })
                      return
                    }
                    handleGenerateBlueprint()
                  }}
                  disabled={isGeneratingBlueprint}
                  size="lg"
                >
                  {isGeneratingBlueprint ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  {isGeneratingBlueprint ? t('generatingInProgress') : t('generate')}
                </Button>
              </div>
            </div>

            {/* Visual connection line between Column 1 and Column 2 */}
            <div className="relative flex items-center justify-center w-4 border-r">
              <div className="absolute h-16 w-px bg-gradient-to-b from-primary/50 via-primary/30 to-transparent" />
              <div className="absolute h-2 w-2 rounded-full bg-primary/50 animate-pulse" />
            </div>

            {/* Column 2: Production Canvas */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Column 2 Header with tabs */}
              <div className="flex items-center justify-between px-4 py-2 border-b h-[57px] flex-shrink-0">
                <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border">
                  <Button
                    variant={activeFold2Page === 0 ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-4 text-xs rounded-full transition-all font-medium",
                      activeFold2Page === 0 ? "shadow-sm bg-background" : "hover:bg-background/50 text-muted-foreground"
                    )}
                    onClick={() => setActiveFold2Page(0)}
                  >
                    {t('column2.blueprintTab')}
                  </Button>
                  <Button
                    variant={activeFold2Page === 1 ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "h-7 px-4 text-xs rounded-full transition-all font-medium",
                      activeFold2Page === 1 ? "shadow-sm bg-background" : "hover:bg-background/50 text-muted-foreground"
                    )}
                    onClick={() => setActiveFold2Page(1)}
                  >
                    {t('column2.auditTab')}
                  </Button>
                </div>

                {activeFold2Page === 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                      onClick={() => {
                        const { productionResult } = useVibeWriteStore.getState()
                        exportFile(productionResult.title || 'document', productionResult.fullContent || '', 'md')
                          .then(() => toast.success(t('toast.exportedMarkdown')))
                          .catch(() => toast.error(t('toast.exportFailed')))
                      }}
                    >
                      <FileCode className="h-3.5 w-3.5" />
                      {t('exportMarkdown')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                      onClick={() => {
                        const { productionResult } = useVibeWriteStore.getState()
                        exportFile(productionResult.title || 'document', productionResult.fullContent || '', 'docx')
                          .then(() => toast.success(t('toast.exportedDocx')))
                          .catch(() => toast.error(t('toast.exportFailed')))
                      }}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      {t('exportDocx')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-2 text-xs font-medium border-primary/20 hover:bg-primary/5 hover:text-primary transition-all"
                      onClick={() => {
                        const { productionResult } = useVibeWriteStore.getState()
                        exportFile(productionResult.title || 'document', productionResult.fullContent || '', 'txt')
                          .then(() => toast.success(t('toast.exportedTxt')))
                          .catch(() => toast.error(t('toast.exportFailed')))
                      }}
                    >
                      <File className="h-3.5 w-3.5" />
                      {t('exportTxt')}
                    </Button>
                  </div>
                )}
              </div>

              {/* Column 2 Content Container */}
              <div className="flex-1 min-h-0 w-full relative">
                <ScrollArea className="h-full w-full">
                  <div className="p-6 pb-28">
                    {activeFold2Page === 0 ? (
                      <BlueprintEditor />
                    ) : (
                      <AuditPanel />
                    )}
                  </div>
                </ScrollArea>

              </div>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
