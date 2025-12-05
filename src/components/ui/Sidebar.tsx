import { useScenes } from '@/hooks/useScenes'
import { useUIStore } from '@/store/useUIStore'
import { Editor } from '@tiptap/react'
import clsx from 'clsx'
import { useAudio } from '@/hooks/useAudio'

export const Sidebar = ({ editor }: { editor: Editor | null }) => {
    const scenes = useScenes(editor)
    const { isFocusMode, isSoundEnabled, toggleSound } = useUIStore()
    const { playReturn } = useAudio()

    const handlePDF = () => {
        window.print()
    }

    const handleJSON = () => {
        if (!editor) return
        const json = editor.getJSON()
        const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'screenplay.json'
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className={clsx(
            "fixed left-0 top-0 h-full w-64 flex flex-col p-8 transition-opacity duration-700 ease-in-out z-10",
            isFocusMode ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            <h2 className="font-bold mb-6 text-xs tracking-widest text-ink/40 uppercase font-sans">Scene Strip</h2>

            <div className="flex-1 overflow-y-auto mb-6">
                {scenes.length === 0 && <p className="text-xs text-ink/30 italic">No scenes yet...</p>}
                <ul className="space-y-3">
                    {scenes.map((scene, i) => (
                        <li key={i}
                            className="text-xs font-bold text-ink/60 hover:text-ink cursor-pointer transition-colors duration-200 uppercase leading-snug"
                            onClick={() => {
                                playReturn()
                                if (editor) {
                                    // Find the node in the DOM to scroll to it smoothly
                                    // Tiptap's pos is document pos. We need to find the DOM element.
                                    const { view } = editor
                                    // This finds the DOM node at the start of the node
                                    try {
                                        const dom = view.nodeDOM(scene.pos) as HTMLElement
                                        if (dom) {
                                            dom.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            editor.chain().focus().setTextSelection(scene.pos + 1).run()
                                        } else {
                                            // Fallback
                                            editor.chain().focus().setTextSelection(scene.pos + 1).scrollIntoView().run()
                                        }
                                    } catch (e) {
                                        editor.chain().focus().setTextSelection(scene.pos + 1).scrollIntoView().run()
                                    }
                                }
                            }}>
                            {scene.text || "UNTITLED"}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="border-t border-ink/10 pt-6 space-y-4">
                <button onClick={toggleSound} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                    {isSoundEnabled ? 'Sound: On' : 'Sound: Muted'}
                </button>
                <button onClick={handlePDF} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                    Export PDF
                </button>
                <button onClick={handleJSON} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                    Export JSON
                </button>
            </div>
        </div>
    )
}
