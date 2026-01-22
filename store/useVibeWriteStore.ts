import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AtomicFact, BlueprintNode, Material } from '@/lib/types'

// Define types specific to VibeWrite
export interface VibeWriteAtomicFact extends AtomicFact {
  // Extend if needed
}

export interface VibeWriteBlueprintNode extends BlueprintNode {
  content?: string
  status: 'pending' | 'generating' | 'completed' | 'error'
  needsUpdate: boolean
  progress?: number
  customInstruction?: string
}

export interface HistoryDocument {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
  intent: string
  materials: Material[]
  facts: VibeWriteAtomicFact[]
  blueprintNodes: VibeWriteBlueprintNode[]
  productionResult: {
    title: string
    fullContent: string
  }
  // Configuration UI State
  missingInformation: string[]
  dynamicFields: any[]
  showFactSelection: boolean
  showDynamicForm: boolean
  // New persistence fields
  formData: Record<string, any>
  selectedMaterialIds: string[]
  hasGeneratedBlueprint: boolean
  activeFold2Page: 0 | 1
}

interface VibeWriteState {
  // Persistent State
  language: 'zh' | 'en' | 'ja' | 'ko'
  setLanguage: (language: 'zh' | 'en' | 'ja' | 'ko') => void

  historyDocuments: HistoryDocument[]
  currentDocumentId: string | null
  setCurrentDocumentId: (id: string | null) => void
  addHistoryDocument: (doc: Omit<HistoryDocument, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateHistoryDocument: (id: string, updates: Partial<HistoryDocument>) => void
  deleteHistoryDocument: (id: string) => void

  // Workflow State
  activeFold2Page: 0 | 1 // 0: Blueprint, 1: Audit
  setActiveFold2Page: (page: 0 | 1) => void

  // Data State
  atomicFacts: VibeWriteAtomicFact[]
  setAtomicFacts: (facts: VibeWriteAtomicFact[]) => void
  updateAtomicFact: (id: string, updates: Partial<VibeWriteAtomicFact>) => void
  toggleAtomicFact: (id: string) => void

  blueprintNodes: VibeWriteBlueprintNode[]
  setBlueprintNodes: (nodes: VibeWriteBlueprintNode[]) => void
  updateBlueprintNode: (id: string, updates: Partial<VibeWriteBlueprintNode>) => void
  reorderBlueprintNodes: (startIndex: number, endIndex: number) => void
  markNodeNeedsUpdate: (nodeId: string) => void

  // Production Result
  productionResult: {
    title: string
    fullContent: string
    auditResults: any[]
    isAuditing: boolean
    isRefining: boolean
  }
  setProductionResult: (result: Partial<VibeWriteState['productionResult']>) => void
  resetProductionResult: () => void

  // Materials/Intent (shared with existing store)
  intent: string
  setIntent: (intent: string) => void
  materials: Material[]
  setMaterials: (materials: Material[]) => void
  addMaterial: (material: Material) => void
  removeMaterial: (id: string) => void

  // Search
  isSearchEnabled: boolean
  setSearchEnabled: (enabled: boolean) => void

  // UI State
  isSidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Interaction Logic
  handleFactToggle: (factId: string) => void

  // FormData for generation
  formData: Record<string, any>
  setFormData: (data: Record<string, any>) => void

  // Generation Status
  isGeneratingBlueprint: boolean
  setIsGeneratingBlueprint: (isGenerating: boolean) => void

  // Material Selection
  selectedMaterialIds: string[]
  setSelectedMaterialIds: (ids: string[]) => void
  toggleMaterialSelection: (id: string) => void

  // Trigger
  shouldAutoGenerate: boolean
  setShouldAutoGenerate: (should: boolean) => void

  // Flow State
  hasGeneratedBlueprint: boolean
  setHasGeneratedBlueprint: (has: boolean) => void

  // Configuration UI State (Transient but persisted for history)
  missingInformation: string[]
  setMissingInformation: (info: string[]) => void
  dynamicFields: any[]
  setDynamicFields: (fields: any[]) => void
  showFactSelection: boolean
  setShowFactSelection: (show: boolean) => void
  showDynamicForm: boolean
  setShowDynamicForm: (show: boolean) => void

  // Reset
  resetProject: () => void

  // Internal Logic
  syncHistory: (updates: Partial<HistoryDocument>) => void
}

const initialBlueprintNodes: VibeWriteBlueprintNode[] = []

export const useVibeWriteStore = create<VibeWriteState>()(
  persist(
    (set, get) => ({
      // Central helper to sync current state to active history document
      syncHistory: (updates: Partial<HistoryDocument>) => {
        const { currentDocumentId, historyDocuments } = get()
        if (currentDocumentId) {
          set({
            historyDocuments: historyDocuments.map(d =>
              d.id === currentDocumentId
                ? { ...d, ...updates, updatedAt: new Date() }
                : d
            )
          })
        }
      },

      // Persistent State
      language: 'zh',
      setLanguage: (language) => set({ language }),

      historyDocuments: [],
      currentDocumentId: null,
      setCurrentDocumentId: (id) => {
        // First, save current state to the old document before switching
        const currentId = get().currentDocumentId
        if (currentId) {
          const state = get()
          set((s) => ({
            historyDocuments: s.historyDocuments.map(d =>
              d.id === currentId
                ? {
                  ...d,
                  intent: state.intent,
                  materials: state.materials,
                  facts: state.atomicFacts,
                  blueprintNodes: state.blueprintNodes,
                  productionResult: {
                    title: state.productionResult.title,
                    fullContent: state.productionResult.fullContent
                  },
                  missingInformation: state.missingInformation,
                  dynamicFields: state.dynamicFields,
                  showFactSelection: state.showFactSelection,
                  showDynamicForm: state.showDynamicForm,
                  formData: state.formData,
                  selectedMaterialIds: state.selectedMaterialIds,
                  hasGeneratedBlueprint: state.hasGeneratedBlueprint,
                  activeFold2Page: state.activeFold2Page,
                  updatedAt: new Date()
                }
                : d
            )
          }))
        }

        console.log('Switching to document:', id)
        if (!id) {
          set({ currentDocumentId: null })
          return
        }

        const doc = get().historyDocuments.find(d => d.id === id)
        if (doc) {
          console.log('Document found, loading data:', doc.title)
          set({
            currentDocumentId: id,
            intent: doc.intent || '',
            materials: doc.materials || [],
            atomicFacts: doc.facts || [],
            blueprintNodes: doc.blueprintNodes || [],
            productionResult: {
              ...get().productionResult,
              title: doc.productionResult?.title || '',
              fullContent: doc.productionResult?.fullContent || '',
            },
            hasGeneratedBlueprint: doc.hasGeneratedBlueprint ?? (doc.blueprintNodes?.length || 0) > 0,
            activeFold2Page: doc.activeFold2Page ?? 0,
            // Restore UI state
            missingInformation: doc.missingInformation || [],
            dynamicFields: doc.dynamicFields || [],
            showFactSelection: doc.showFactSelection || false,
            showDynamicForm: doc.showDynamicForm || false,
            formData: doc.formData || {},
            selectedMaterialIds: doc.selectedMaterialIds || [],
          })
        } else {
          console.warn('Document NOT found in history:', id)
        }
      },
      addHistoryDocument: (doc) => set((state) => {
        const newDoc: HistoryDocument = {
          ...doc,
          id: `doc-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
          missingInformation: state.missingInformation,
          dynamicFields: state.dynamicFields,
          showFactSelection: state.showFactSelection,
          showDynamicForm: state.showDynamicForm,
          formData: state.formData,
          selectedMaterialIds: state.selectedMaterialIds,
          hasGeneratedBlueprint: state.hasGeneratedBlueprint,
          activeFold2Page: state.activeFold2Page,
        }
        return {
          historyDocuments: [newDoc, ...state.historyDocuments],
          currentDocumentId: newDoc.id,
        }
      }),
      updateHistoryDocument: (id, updates) => set((state) => ({
        historyDocuments: state.historyDocuments.map(doc =>
          doc.id === id
            ? { ...doc, ...updates, updatedAt: new Date() }
            : doc
        ),
      })),
      deleteHistoryDocument: (id) => set((state) => ({
        historyDocuments: state.historyDocuments.filter(doc => doc.id !== id),
        currentDocumentId: state.currentDocumentId === id ? null : state.currentDocumentId,
      })),

      // Workflow State
      activeFold2Page: 0,
      setActiveFold2Page: (page) => set((state) => {
        state.syncHistory({ activeFold2Page: page })
        return { activeFold2Page: page }
      }),

      // Data State
      atomicFacts: [],
      setAtomicFacts: (facts) => set((state) => {
        state.syncHistory({ facts })
        return { atomicFacts: facts }
      }),
      updateAtomicFact: (id, updates) => set((state) => {
        const newFacts = state.atomicFacts.map(fact =>
          fact.id === id ? { ...fact, ...updates } : fact
        )
        state.syncHistory({ facts: newFacts })
        return { atomicFacts: newFacts }
      }),
      toggleAtomicFact: (id) => set((state) => {
        const newFacts = state.atomicFacts.map(fact =>
          fact.id === id ? { ...fact, enabled: !fact.enabled } : fact
        )
        state.syncHistory({ facts: newFacts })
        return { atomicFacts: newFacts }
      }),

      blueprintNodes: initialBlueprintNodes,
      setBlueprintNodes: (nodes) => set((state) => {
        state.syncHistory({ blueprintNodes: nodes })
        return { blueprintNodes: nodes }
      }),
      updateBlueprintNode: (id, updates) => set((state) => {
        const newNodes = state.blueprintNodes.map(node =>
          node.id === id ? { ...node, ...updates } : node
        )
        state.syncHistory({ blueprintNodes: newNodes })
        return { blueprintNodes: newNodes }
      }),
      reorderBlueprintNodes: (startIndex, endIndex) => set((state) => {
        const result = [...state.blueprintNodes]
        const [removed] = result.splice(startIndex, 1)
        result.splice(endIndex, 0, removed)

        // Update order property
        const updated = result.map((node, index) => ({
          ...node,
          order: index,
        }))

        state.syncHistory({ blueprintNodes: updated })
        return { blueprintNodes: updated }
      }),
      markNodeNeedsUpdate: (nodeId) => set((state) => {
        const newNodes = state.blueprintNodes.map(node =>
          node.id === nodeId ? { ...node, needsUpdate: true } : node
        )
        state.syncHistory({ blueprintNodes: newNodes })
        return { blueprintNodes: newNodes }
      }),

      // Production Result
      productionResult: {
        title: '',
        fullContent: '',
        auditResults: [],
        isAuditing: false,
        isRefining: false,
      },
      setProductionResult: (result) => set((state) => {
        const newResult = { ...state.productionResult, ...result }
        state.syncHistory({ productionResult: { title: newResult.title, fullContent: newResult.fullContent } })
        return { productionResult: newResult }
      }),
      resetProductionResult: () => set((state) => {
        const reset = {
          title: '',
          fullContent: '',
          auditResults: [],
          isAuditing: false,
          isRefining: false,
        }
        state.syncHistory({ productionResult: { title: '', fullContent: '' } })
        return { productionResult: reset }
      }),

      // Materials/Intent
      intent: '',
      setIntent: (intent) => set((state) => {
        state.syncHistory({ intent })
        return { intent }
      }),
      materials: [],
      setMaterials: (materials) => set((state) => {
        state.syncHistory({ materials })
        return { materials }
      }),
      addMaterial: (material) => set((state) => {
        const newMaterials = [...state.materials, material]
        state.syncHistory({ materials: newMaterials })
        return { materials: newMaterials }
      }),
      removeMaterial: (id) => set((state) => {
        const materials = state.materials.filter((m) => m.id !== id)
        const selectedMaterialIds = state.selectedMaterialIds.filter((mid) => mid !== id)
        state.syncHistory({ materials, selectedMaterialIds })
        return { materials, selectedMaterialIds }
      }),

      // Search
      isSearchEnabled: true,
      setSearchEnabled: (enabled) => set({ isSearchEnabled: enabled }),

      // UI State
      isSidebarCollapsed: false,
      toggleSidebarCollapsed: () => set((state) => ({
        isSidebarCollapsed: !state.isSidebarCollapsed
      })),
      setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),

      // Interaction Logic
      handleFactToggle: (factId) => {
        const { atomicFacts, blueprintNodes, syncHistory } = get()
        const fact = atomicFacts.find(f => f.id === factId)
        if (!fact) return

        // Update fact enabled state
        const newFacts = atomicFacts.map(f =>
          f.id === factId ? { ...f, enabled: !f.enabled } : f
        )

        // Mark associated blueprint nodes as needing update
        const newNodes = blueprintNodes.map(node => ({
          ...node,
          needsUpdate: true,
        }))

        set({
          atomicFacts: newFacts,
          blueprintNodes: newNodes,
        })

        // Sync to history
        syncHistory({ facts: newFacts, blueprintNodes: newNodes })
      },

      // FormData
      formData: {},
      setFormData: (formData) => set((state) => {
        state.syncHistory({ formData })
        return { formData }
      }),

      // Generation Status
      isGeneratingBlueprint: false,
      setIsGeneratingBlueprint: (isGenerating) => set({ isGeneratingBlueprint: isGenerating }),

      // Material Selection
      selectedMaterialIds: [],
      setSelectedMaterialIds: (ids) => set((state) => {
        state.syncHistory({ selectedMaterialIds: ids })
        return { selectedMaterialIds: ids }
      }),
      toggleMaterialSelection: (id) => set((state) => {
        const current = new Set(state.selectedMaterialIds)
        if (current.has(id)) {
          current.delete(id)
        } else {
          current.add(id)
        }
        const ids = Array.from(current)
        state.syncHistory({ selectedMaterialIds: ids })
        return { selectedMaterialIds: ids }
      }),

      // Trigger
      shouldAutoGenerate: false,
      setShouldAutoGenerate: (should) => set({ shouldAutoGenerate: should }),

      // Flow State
      hasGeneratedBlueprint: false,
      setHasGeneratedBlueprint: (has) => set((state) => {
        state.syncHistory({ hasGeneratedBlueprint: has })
        return { hasGeneratedBlueprint: has }
      }),

      // Configuration UI State
      missingInformation: [],
      setMissingInformation: (info) => set((state) => {
        state.syncHistory({ missingInformation: info })
        return { missingInformation: info }
      }),
      dynamicFields: [],
      setDynamicFields: (fields) => set((state) => {
        state.syncHistory({ dynamicFields: fields })
        return { dynamicFields: fields }
      }),
      showFactSelection: false,
      setShowFactSelection: (show) => set((state) => {
        state.syncHistory({ showFactSelection: show })
        return { showFactSelection: show }
      }),
      showDynamicForm: false,
      setShowDynamicForm: (show) => set((state) => {
        state.syncHistory({ showDynamicForm: show })
        return { showDynamicForm: show }
      }),

      // Reset Project
      resetProject: () => set({
        intent: '',
        materials: [],
        selectedMaterialIds: [],
        atomicFacts: [],
        blueprintNodes: [],
        productionResult: {
          title: '',
          fullContent: '',
          auditResults: [],
          isAuditing: false,
          isRefining: false,
        },
        hasGeneratedBlueprint: false,
        activeFold2Page: 0,
        formData: {},
        currentDocumentId: null,
        missingInformation: [],
        dynamicFields: [],
        showFactSelection: false,
        showDynamicForm: false,
      }),
    }),
    {
      name: 'vibewrite-storage',
      partialize: (state) => ({
        // User preferences
        language: state.language,
        isSidebarCollapsed: state.isSidebarCollapsed,
        // Document history
        historyDocuments: state.historyDocuments,
        currentDocumentId: state.currentDocumentId,
        // Working document state (persisted for session recovery)
        intent: state.intent,
        materials: state.materials.map(m => ({
          ...m,
          file: undefined // Can't serialize File objects
        })),
        selectedMaterialIds: state.selectedMaterialIds,
        atomicFacts: state.atomicFacts,
        formData: state.formData,
        blueprintNodes: state.blueprintNodes,
        productionResult: state.productionResult,
        hasGeneratedBlueprint: state.hasGeneratedBlueprint,
        // UI State for session recovery
        missingInformation: state.missingInformation,
        dynamicFields: state.dynamicFields,
        showFactSelection: state.showFactSelection,
        showDynamicForm: state.showDynamicForm,
      }),
    }
  )
)