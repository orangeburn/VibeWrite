"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SceneConfiguration } from "@/components/scene-configuration"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function AppSidebar({ className, isCollapsed }: { className?: string; isCollapsed?: boolean }) {
    const triggerGeneration = useAppStore((state) => state.triggerGeneration)
    const { intent } = useAppStore((state) => state.sceneContext)

    // Minimal requirement: intent must be non-empty. 
    // This provides the most robust entry point for generation.
    const canGenerate = !!intent?.trim()

    return (
        <div className={cn("flex flex-col bg-background h-full overflow-hidden transition-all duration-700", className)}>
            <ScrollArea className={cn("flex-1 min-h-0", isCollapsed && "pointer-events-none")}>
                <div className="p-4 flex flex-col items-center">
                    <div className="w-full max-w-3xl mx-auto">
                        <SceneConfiguration mode="sidebar" />
                    </div>
                </div>
            </ScrollArea>

            <div className={cn("p-4 border-t bg-background/80 backdrop-blur-sm transition-all duration-700 flex justify-center", isCollapsed && "opacity-0 h-0 p-0 pointer-events-none")}>
                <div className="w-full max-w-3xl mx-auto">
                    <Button
                        className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 group disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={triggerGeneration}
                        disabled={!canGenerate}
                    >
                        <Sparkles className="mr-2 h-5 w-5 group-hover:animate-pulse" />
                        开始智能生成
                    </Button>
                </div>
            </div>
        </div>
    )
}
