import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type MoodTheme = 'default' | 'dawn' | 'sepia' | 'fog' | 'forest'
export type AmbientSound = 'none' | 'rain' | 'fireplace' | 'birds' | 'coffee'

interface UIState {
    isFocusMode: boolean
    setFocusMode: (value: boolean) => void
    isSoundEnabled: boolean
    toggleSound: () => void
    isNightMode: boolean
    toggleNightMode: () => void
    isWordFocusMode: boolean
    toggleWordFocus: () => void

    currentTheme: MoodTheme
    setTheme: (theme: MoodTheme) => void

    isReflectionMode: boolean
    toggleReflectionMode: () => void
    ambientSound: AmbientSound
    setAmbientSound: (sound: AmbientSound) => void
    ambientVolume: number
    setAmbientVolume: (volume: number) => void

    currentScriptId: number | null
    setCurrentScriptId: (id: number | null) => void
    isSaving: boolean
    setIsSaving: (value: boolean) => void

    scriptTitle: string
    setScriptTitle: (title: string) => void
    scriptAuthor: string
    setScriptAuthor: (author: string) => void

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
            isWordFocusMode: false,
            toggleWordFocus: () => set((state) => ({ isWordFocusMode: !state.isWordFocusMode })),

            currentTheme: 'default',
            setTheme: (theme) => set({ currentTheme: theme }),

            isReflectionMode: false,
            toggleReflectionMode: () => set((state) => ({ isReflectionMode: !state.isReflectionMode })),
            ambientSound: 'none',
            setAmbientSound: (sound) => set({ ambientSound: sound }),
            ambientVolume: 0.5,
            setAmbientVolume: (volume) => set({ ambientVolume: volume }),

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
                isWordFocusMode: state.isWordFocusMode,
                currentTheme: state.currentTheme,
                isReflectionMode: state.isReflectionMode,
                ambientSound: state.ambientSound,
                ambientVolume: state.ambientVolume,
                currentScriptId: state.currentScriptId,
            }),
        }
    )
)
