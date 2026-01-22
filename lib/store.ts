import { create } from 'zustand'
import { Material } from './types'
import { AtomicFact } from './types'

interface SceneContext {
    intent: string
    selectedFacts: string[] // IDs of selected themes
    formData: Record<string, any> // Background info
    globalThemes: AtomicFact[] // Store global facts/themes here
    dynamicFields: any[] // Store field definitions for labels

    // UI State
    isParsed: boolean
    showDynamicForm: boolean
    showFactSelection: boolean
    missingInfo: string[]
}

interface AppState {
    isSearchEnabled: boolean
    setSearchEnabled: (enabled: boolean) => void

    language: 'zh' | 'en' | 'ja' | 'ko'
    setLanguage: (language: 'zh' | 'en' | 'ja' | 'ko') => void

    materials: Material[]
    setMaterials: (materials: Material[]) => void
    addMaterial: (material: Material) => void
    removeMaterial: (id: string) => void

    sceneContext: SceneContext
    setSceneContext: (context: Partial<SceneContext>) => void
    resetSceneContext: () => void

    generationTrigger: number
    triggerGeneration: () => void

    activeFold: 1 | 2
    setActiveFold: (fold: 1 | 2) => void

    productionResult: {
        title: string
        fullContent: string
        auditResults: any[]
    }
    setProductionResult: (result: Partial<AppState['productionResult']>) => void
    resetProductionResult: () => void
}

const initialSceneContext: SceneContext = {
    intent: "",
    selectedFacts: [],
    formData: {},
    globalThemes: [],
    dynamicFields: [],
    isParsed: false,
    showDynamicForm: false,
    showFactSelection: false,
    missingInfo: []
}

const initialProductionResult = {
    title: "",
    fullContent: "",
    auditResults: []
}

export const useAppStore = create<AppState>((set) => ({
    isSearchEnabled: true,
    setSearchEnabled: (enabled) => set({ isSearchEnabled: enabled }),

    language: 'zh', // Default to Chinese
    setLanguage: (language) => set({ language }),

    materials: [],
    setMaterials: (materials) => set({ materials }),
    addMaterial: (material) => set((state) => ({
        materials: [...state.materials, material]
    })),
    removeMaterial: (id) => set((state) => ({
        materials: state.materials.filter((m) => m.id !== id)
    })),

    sceneContext: initialSceneContext,
    setSceneContext: (context) => set((state) => ({
        sceneContext: { ...state.sceneContext, ...context } as SceneContext
    })),
    resetSceneContext: () => set({ sceneContext: initialSceneContext }),

    generationTrigger: 0,
    triggerGeneration: () => set((state) => ({
        generationTrigger: state.generationTrigger + 1,
        activeFold: 2 // Auto-switch to fold 2 on generation
    })),

    activeFold: 1,
    setActiveFold: (fold) => set({ activeFold: fold }),

    productionResult: initialProductionResult,
    setProductionResult: (result) => set((state) => ({
        productionResult: { ...state.productionResult, ...result }
    })),
    resetProductionResult: () => set({ productionResult: initialProductionResult }),
}))
