import { useEffect, useRef } from 'react'
import { Editor } from '@tiptap/react'
import { db } from '@/lib/db'
import { useUIStore } from '@/store/useUIStore'

export const useAutosave = (editor: Editor | null, scriptId: number | null) => {
    const { setIsSaving } = useUIStore()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const editorRef = useRef(editor)
    const scriptIdRef = useRef(scriptId)

    useEffect(() => {
        editorRef.current = editor
        scriptIdRef.current = scriptId
    }, [editor, scriptId])

    useEffect(() => {
        if (!editor || !scriptId) return

        const save = async () => {
            const currentEditor = editorRef.current
            const currentId = scriptIdRef.current
            if (!currentEditor || !currentId) return

            try {
                const json = currentEditor.getJSON()
                await db.scripts.update(currentId, {
                    content: json,
                    updatedAt: new Date()
                })
                setIsSaving(false)
            } catch (error) {
                console.error("Failed to autosave:", error)
            }
        }

        const handleUpdate = () => {
            setIsSaving(true)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(save, 1000)
        }

        editor.on('update', handleUpdate)

        const handleBeforeUnload = () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                save()
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            editor.off('update', handleUpdate)
            window.removeEventListener('beforeunload', handleBeforeUnload)
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
                save()
            }
        }
    }, [editor, scriptId, setIsSaving])
}
