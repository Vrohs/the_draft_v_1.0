import { renderHook, act, waitFor } from '@testing-library/react'
import { useAutosave } from '../useAutosave'
import { db } from '@/lib/db'
import { useUIStore } from '@/store/useUIStore'

describe('useAutosave Integration', () => {
    beforeEach(async () => {
        await db.scripts.clear()
        useUIStore.setState({ isSaving: false })
    })

    it('updates DB after debounce', async () => {
        // Setup initial script
        const id = await db.scripts.add({
            title: 'Autosave Test',
            author: 'Me',
            content: { type: 'doc', content: [] },
            createdAt: new Date(),
            updatedAt: new Date()
        })

        // Mock Editor
        const onUpdateMock = jest.fn()
        const offUpdateMock = jest.fn()
        const getJSONMock = jest.fn().mockReturnValue({ type: 'doc', content: [{ type: 'paragraph' }] })

        const mockEditor = {
            on: onUpdateMock,
            off: offUpdateMock,
            getJSON: getJSONMock
        } as unknown as any // eslint-disable-line @typescript-eslint/no-explicit-any

        renderHook(() => useAutosave(mockEditor, id))

        // Simulate update
        expect(onUpdateMock).toHaveBeenCalledWith('update', expect.any(Function))
        const updateHandler = onUpdateMock.mock.calls[0][1]

        // Trigger update
        act(() => {
            updateHandler()
        })

        // Should be saving immediately (state update)
        expect(useUIStore.getState().isSaving).toBe(true)

        // Wait for debounce (1s)
        await waitFor(async () => {
            const script = await db.scripts.get(id)
            expect(script?.content).toEqual({ type: 'doc', content: [{ type: 'paragraph' }] })
        }, { timeout: 2000 })

        // Should be done saving
        await waitFor(() => {
            expect(useUIStore.getState().isSaving).toBe(false)
        })
    })
})
