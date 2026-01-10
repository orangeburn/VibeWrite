"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Upload, Link2, X, FileText, Globe } from "lucide-react"
import type { Material } from "@/lib/types"

interface MaterialUploaderProps {
  materials: Material[]
  onMaterialsChange: (materials: Material[]) => void
}

export function MaterialUploader({ materials, onMaterialsChange }: MaterialUploaderProps) {
  const [urlInput, setUrlInput] = useState("")

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newMaterials: Material[] = Array.from(files).map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      type: "file",
      name: file.name,
      file: file,
      facts: [],
    }))

    onMaterialsChange([...materials, ...newMaterials])
  }

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return

    const newMaterial: Material = {
      id: `url-${Date.now()}`,
      type: "url",
      name: urlInput,
      url: urlInput,
      facts: [],
    }

    onMaterialsChange([...materials, newMaterial])
    setUrlInput("")
  }

  const handleRemoveMaterial = (id: string) => {
    onMaterialsChange(materials.filter((m) => m.id !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 gap-2">
          <Input
            placeholder="粘贴 URL 链接..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleUrlAdd()
              }
            }}
          />
          <Button
            variant="outline"
            onClick={handleUrlAdd}
            disabled={!urlInput.trim()}
            className="whitespace-nowrap bg-transparent"
          >
            <Link2 className="mr-2 h-4 w-4" />
            添加链接
          </Button>
        </div>

        <Button variant="outline" className="relative bg-transparent" asChild>
          <label>
            <Upload className="mr-2 h-4 w-4" />
            上传文件
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              className="absolute inset-0 cursor-pointer opacity-0"
              accept=".pdf,.doc,.docx,.txt,.md"
            />
          </label>
        </Button>
      </div>

      {materials.length > 0 && (
        <div className="space-y-2">
          {materials.map((material) => (
            <Card key={material.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-muted">
                  {material.type === "file" ? (
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Globe className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">{material.name}</p>
                  <p className="text-xs text-muted-foreground">{material.type === "file" ? "本地文件" : "网页链接"}</p>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={() => handleRemoveMaterial(material.id)}>
                <X className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
