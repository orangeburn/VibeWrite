"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { StepIndicator } from "@/components/step-indicator"
import { SceneConfiguration } from "@/components/scene-configuration"
const ModularProduction = dynamic(
  () => import("@/components/modular-production").then((mod) => mod.ModularProduction),
  { ssr: false }
)
const IntegrationAudit = dynamic(
  () => import("@/components/integration-audit").then((mod) => mod.IntegrationAudit),
  { ssr: false }
)
import { ThemeToggle } from "@/components/theme-toggle"
import { FileText, Settings2, Sparkles, CheckCircle2 } from "lucide-react"

const BlueprintFramework = dynamic(
  () => import("@/components/blueprint-framework").then((mod) => mod.BlueprintFramework),
  { ssr: false }
)

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [globalContext, setGlobalContext] = useState<any>(null)
  const [blueprintData, setBlueprintData] = useState<any>(null)
  const [productionData, setProductionData] = useState<any>(null)

  const steps = [
    { id: 1, name: "场景配置", icon: Settings2, description: "定义角色与事实边界" },
    { id: 2, name: "蓝图规划", icon: FileText, description: "拆解任务节点" },
    { id: 3, name: "模块生产", icon: Sparkles, description: "隔离生成内容" },
    { id: 4, name: "整合审计", icon: CheckCircle2, description: "逐步衔接重写" },
  ]

  const handleNext = (data?: any) => {
    if (currentStep === 1) {
      setGlobalContext(data)
    } else if (currentStep === 2) {
      setBlueprintData(data)
    } else if (currentStep === 3) {
      setProductionData(data)
    }

    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Sparkles className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">VibeWrite</h1>
                <p className="text-xs text-muted-foreground">共识驱动的 AI 协作工具</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StepIndicator steps={steps} currentStep={currentStep} />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="mx-auto max-w-6xl">
          {currentStep === 1 && <SceneConfiguration initialData={globalContext} onNext={handleNext} />}
          {currentStep === 2 && (
            <BlueprintFramework
              globalContext={globalContext}
              initialData={blueprintData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 3 && (
            <ModularProduction
              blueprintData={blueprintData}
              globalContext={globalContext}
              initialData={productionData}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
          {currentStep === 4 && (
            <IntegrationAudit
              productionData={productionData}
              blueprintData={blueprintData}
              globalContext={globalContext}
              onBack={handleBack}
            />
          )}
        </div>
      </main>
    </div>
  )
}
