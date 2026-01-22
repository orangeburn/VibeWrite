"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, FileText, Clock, FolderOpen, Trash2, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { useVibeWriteStore } from "@/store/useVibeWriteStore"
import { format } from "date-fns"
import { zhCN, enUS, ja, ko } from "date-fns/locale"
import { useTranslation } from "@/lib/i18n"

interface GlobalSidebarProps {
  isCollapsed?: boolean
}

export function GlobalSidebar({ isCollapsed = false }: GlobalSidebarProps) {
  const { t } = useTranslation()
  const {
    historyDocuments,
    currentDocumentId,
    setCurrentDocumentId,
    deleteHistoryDocument,
  } = useVibeWriteStore()

  const handleNewDocument = () => {
    useVibeWriteStore.getState().resetProject()
  }

  const handleSelectDocument = (id: string) => {
    setCurrentDocumentId(id)
  }

  const handleDeleteDocument = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteHistoryDocument(id)
  }

  const getDateLocale = () => {
    const lang = useVibeWriteStore.getState().language
    switch (lang) {
      case 'zh': return zhCN
      case 'ja': return ja
      case 'ko': return ko
      default: return enUS
    }
  }

  const formatDate = (date: Date) => {
    return format(date, 'MM/dd HH:mm', { locale: getDateLocale() })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={cn(
        "border-b",
        isCollapsed ? "p-2" : "p-3"
      )}>
        {isCollapsed ? (
          // Collapsed: vertical stack
          <div className="flex flex-col items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={useVibeWriteStore.getState().toggleSidebarCollapsed}
              title={t('sidebar.expand')}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              className="h-9 w-9"
              onClick={handleNewDocument}
              title={t('createNewProject')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          // Expanded: horizontal layout
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0"
              onClick={useVibeWriteStore.getState().toggleSidebarCollapsed}
              title={t('sidebar.collapse')}
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex-1 h-8"
              onClick={handleNewDocument}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              {t('createNewProject')}
            </Button>
          </div>
        )}
      </div>

      {/* History documents list */}
      <ScrollArea className="flex-1">
        <div className={cn("py-2", isCollapsed ? "px-1.5" : "px-2")}>
          {isCollapsed ? (
            // Collapsed view: icons only
            <div className="flex flex-col items-center gap-1">
              {historyDocuments.slice(0, 10).map((doc) => (
                <Button
                  key={doc.id}
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-9 w-9 rounded-lg",
                    currentDocumentId === doc.id && "bg-accent"
                  )}
                  onClick={() => handleSelectDocument(doc.id)}
                  title={doc.title}
                >
                  <FileText className="h-4 w-4" />
                </Button>
              ))}
              {historyDocuments.length === 0 && (
                <div className="py-6">
                  <FolderOpen className="h-5 w-5 mx-auto text-muted-foreground/40" />
                </div>
              )}
            </div>
          ) : (
            // Expanded view: full list
            <div className="space-y-0.5">
              {historyDocuments.length > 0 && (
                <div className="px-2 py-1.5 text-[10px] font-medium text-muted-foreground/70 uppercase tracking-widest">
                  历史文档
                </div>
              )}
              {historyDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className={cn(
                    "group grid grid-cols-[1fr_auto] items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors w-full min-w-0",
                    currentDocumentId === doc.id
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted/60"
                  )}
                  onClick={() => handleSelectDocument(doc.id)}
                >
                  <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                    <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <div className="min-w-0 overflow-hidden">
                      <p className="text-sm font-medium truncate leading-tight" title={doc.title}>
                        {doc.title}
                      </p>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Clock className="h-2.5 w-2.5" />
                        <span>{formatDate(doc.updatedAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDeleteDocument(doc.id, e)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              {historyDocuments.length === 0 && (
                <div className="py-10 text-center">
                  <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-xs text-muted-foreground/60">暂无历史文档</p>
                </div>
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}