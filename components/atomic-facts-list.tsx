"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"
import type { Material } from "@/lib/types"

interface AtomicFactsListProps {
  materials: Material[]
  onFactToggle: (materialId: string, factId: string) => void
}

export function AtomicFactsList({ materials, onFactToggle }: AtomicFactsListProps) {
  const hasAnyFacts = materials.some(m => m.facts.length > 0)

  if (!hasAnyFacts) {
    return null
  }

  return (
    <div className="space-y-4">
      {materials.map((material) => {
        if (material.facts.length === 0) return null

        return (
          <div key={material.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {material.name}
              </Badge>
              <span className="text-xs text-muted-foreground">{material.facts.length} 条事实</span>
            </div>

            <div className="space-y-2">
              {material.facts.map((fact) => (
                <Card
                  key={fact.id}
                  onClick={() => onFactToggle(material.id, fact.id)}
                  className={cn(
                    "cursor-pointer p-3 transition-all relative",
                    fact.enabled
                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                      : "border-muted bg-muted/30 text-muted-foreground opacity-60 hover:opacity-80",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "flex-shrink-0 mt-0.5 h-4 w-4 rounded-sm border transition-colors flex items-center justify-center",
                        fact.enabled
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {fact.enabled && <Check className="h-3 w-3" />}
                    </div>
                    <p className="text-sm leading-relaxed flex-1">{fact.content}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
