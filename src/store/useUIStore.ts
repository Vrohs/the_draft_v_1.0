import { create } from 'zustand'

interface UIState {
    isFocusMode: boolean
    setFocusMode: (value: boolean) => void
    isSoundEnabled: boolean
    toggleSound: () => void
    isNightMode: boolean
    toggleNightMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
    isFocusMode: false,
    setFocusMode: (value) => set({ isFocusMode: value }),
    isSoundEnabled: true,
    toggleSound: () => set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
    isNightMode: false,
    toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
}))
