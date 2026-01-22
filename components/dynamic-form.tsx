"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Material } from "@/lib/types"

interface FieldSchema {
  key: string
  label: string
  type: "text" | "textarea" | "select" | "checkbox"
  options?: string[]
  description?: string
}

interface DynamicFormProps {
  intent: string
  selectedFacts: Material[]
  onComplete: (data: Record<string, any>) => void
  fields?: FieldSchema[]
}

export function DynamicForm({ intent, selectedFacts, onComplete, fields = [] }: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Initialize form data with defaults if needed, or handle externally
  useEffect(() => {
    // If we want to pre-fill or just ensure keys exist
  }, [fields])

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value }
    setFormData(updated)
    onComplete(updated)
  }

  // No fallback to default fields to avoid flashing during regeneration
  const fieldsToRender = fields

  return (
    <div className="space-y-4 w-full min-w-0">
      {fieldsToRender.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>

          {field.type === "text" && (
            <Input
              id={field.key}
              placeholder={field.description}
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
            />
          )}

          {field.type === "textarea" && (
            <Textarea
              id={field.key}
              placeholder={field.description}
              value={formData[field.key] || ""}
              onChange={(e) => handleChange(field.key, e.target.value)}
              rows={3}
              className="resize-none"
            />
          )}

          {field.type === "select" && field.options && (
            <Select value={formData[field.key]} onValueChange={(value) => handleChange(field.key, value)}>
              <SelectTrigger id={field.key} className="w-full min-w-0">
                <SelectValue placeholder={`选择${field.label}`} className="line-clamp-1" />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {field.type === "checkbox" && (
            <div className="space-y-3">
              {field.options && field.options.length > 0 ? (
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3">
                  {field.options.map((opt) => {
                    const currentValues = (formData[field.key] as string[]) || []
                    const isChecked = currentValues.includes(opt)
                    return (
                      <div key={opt} className="flex items-start space-x-2 bg-muted/30 p-2 rounded-md border border-transparent hover:border-border transition-all min-w-0">
                        <Checkbox
                          id={`${field.key}-${opt}`}
                          checked={isChecked}
                          className="mt-0.5 flex-shrink-0"
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleChange(field.key, [...currentValues, opt])
                            } else {
                              handleChange(field.key, currentValues.filter((v) => v !== opt))
                            }
                          }}
                        />
                        <label
                          htmlFor={`${field.key}-${opt}`}
                          className="text-sm font-medium leading-normal cursor-pointer flex-1 break-all min-w-0"
                        >
                          {opt}
                        </label>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={field.key}
                    checked={formData[field.key] || false}
                    onCheckedChange={(checked) => handleChange(field.key, checked)}
                  />
                  <label
                    htmlFor={field.key}
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    {field.description || field.label}
                  </label>
                </div>
              )}
            </div>
          )}

          {field.description && field.type !== "checkbox" && field.type !== "text" && field.type !== "textarea" && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
          )}
        </div>
      ))}
    </div>
  )
}
