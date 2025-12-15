import { create } from 'zustand'
import { persist } from 'zustand/middleware'


interface UIState {
    isFocusMode: boolean
    setFocusMode: (value: boolean) => void
    isSoundEnabled: boolean
    toggleSound: () => void
    isNightMode: boolean
    toggleNightMode: () => void

    // Script Management
    currentScriptId: number | null
    setCurrentScriptId: (id: number | null) => void
    isSaving: boolean
    setIsSaving: (value: boolean) => void

    // Current Script Metadata (for UI)
    scriptTitle: string
    setScriptTitle: (title: string) => void
    scriptAuthor: string
    setScriptAuthor: (author: string) => void

    // Mobile Sidebar State
    isMobileSidebarOpen: boolean
    toggleMobileSidebar: () => void
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            isFocusMode: false,
            setFocusMode: (value) => set({ isFocusMode: value }),
            isSoundEnabled: true,
            toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
            isNightMode: false,
            toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),

            currentScriptId: null,
            setCurrentScriptId: (id) => set({ currentScriptId: id }),
            isSaving: false,
            setIsSaving: (value) => set({ isSaving: value }),

            scriptTitle: 'Untitled',
            setScriptTitle: (title) => set({ scriptTitle: title }),
            scriptAuthor: '',
            setScriptAuthor: (author) => set({ scriptAuthor: author }),

            isMobileSidebarOpen: false,
            toggleMobileSidebar: () => set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),
        }),
        {
            name: 'the-draft-ui-store',
            partialize: (state) => ({
                isSoundEnabled: state.isSoundEnabled,
                isNightMode: state.isNightMode,
                // We might want to persist the last open script too
                currentScriptId: state.currentScriptId,
            }),
        }
    )
)

