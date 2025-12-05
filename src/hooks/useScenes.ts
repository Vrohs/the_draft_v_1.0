import { Editor } from '@tiptap/react'
import { useState, useEffect } from 'react'

export const useScenes = (editor: Editor | null) => {
    const [scenes, setScenes] = useState<{ text: string, pos: number }[]>([])

    useEffect(() => {
        if (!editor) return

        const updateScenes = () => {
            const newScenes: { text: string, pos: number }[] = []
            editor.state.doc.descendants((node, pos) => {
                if (node.type.name === 'slugline') {
                    newScenes.push({ text: node.textContent, pos })
                }
            })
            // Check if scenes changed to avoid unnecessary re-renders?
            // JSON.stringify comparison is heavy but safe for small lists.
            // For now, React handles state updates efficiently.
            setScenes(newScenes)
        }

        updateScenes()

        editor.on('transaction', updateScenes)
        return () => { editor.off('transaction', updateScenes) }
    }, [editor])

    return scenes
}
