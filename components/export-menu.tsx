"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileText, FileCode, File } from "lucide-react"
import { exportFile } from "@/lib/export-utils"
import { toast } from "sonner"
import { useTranslation } from "@/lib/i18n"

interface ExportMenuProps {
  content: string
  title?: string
}

export function ExportMenu({ content, title = "document" }: ExportMenuProps) {
  const { t } = useTranslation()

  const handleExport = async (format: 'md' | 'docx' | 'txt') => {
    try {
      await exportFile(title, content, format)
      toast.success(`已导出为 ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('导出失败')
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          {t('exportMarkdown')}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport('md')} className="cursor-pointer">
          <FileCode className="mr-2 h-4 w-4" />
          {t('exportMarkdown')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('docx')} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          {t('exportDocx')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('txt')} className="cursor-pointer">
          <File className="mr-2 h-4 w-4" />
          {t('exportTxt')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}