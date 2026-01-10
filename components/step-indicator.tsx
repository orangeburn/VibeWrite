import { cn } from "@/lib/utils"
import { Check, type LucideIcon } from "lucide-react"

interface Step {
  id: number
  name: string
  icon: LucideIcon
  description: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const Icon = step.icon
        const isCompleted = currentStep > step.id
        const isCurrent = currentStep === step.id

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                  isCompleted && "bg-accent text-accent-foreground",
                  isCurrent && "bg-accent text-accent-foreground ring-2 ring-accent/30",
                  !isCompleted && !isCurrent && "bg-muted text-muted-foreground",
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="hidden lg:block">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-foreground",
                    !isCurrent && "text-muted-foreground",
                  )}
                >
                  {step.name}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div className={cn("mx-2 h-px w-8 transition-colors", isCompleted ? "bg-accent" : "bg-border")} />
            )}
          </div>
        )
      })}
    </div>
  )
}
