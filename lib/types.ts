export interface AtomicFact {
  id: string
  content: string
  source: string
  enabled: boolean
}

export interface Material {
  id: string
  type: "file" | "url"
  name: string
  url?: string
  file?: File
  facts: AtomicFact[]
}

export interface GlobalContext {
  intent: string
  materials: Material[]
  selectedFacts: string[]
  formData: Record<string, any>
}

export interface BlueprintNode {
  id: string
  title: string
  description: string
  order: number
  materials: Material[]
  localFacts: string[]
  locked?: boolean
  searchEnabled?: boolean
}

export interface Blueprint {
  nodes: BlueprintNode[]
  globalContext: GlobalContext
}

export interface GeneratedContent {
  nodeId: string
  content: string
  status: "pending" | "generating" | "completed" | "error"
}
