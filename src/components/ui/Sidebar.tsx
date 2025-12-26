import { useScenes } from '@/hooks/useScenes'
import { useUIStore } from '@/store/useUIStore'
import { Editor } from '@tiptap/react'
import clsx from 'clsx'
import { useAudio } from '@/hooks/useAudio'
import { useState } from 'react'
import { SettingsDialog } from './SettingsDialog'
import { TranscriptImportDialog } from './TranscriptImportDialog'
import { db } from '@/lib/db'
import { useLiveQuery } from 'dexie-react-hooks'

export const Sidebar = ({ editor }: { editor: Editor | null }) => {
    const scenes = useScenes(editor)
    const {
        isFocusMode,
        isSoundEnabled, toggleSound,
        isNightMode, toggleNightMode,
        isSaving,
        setCurrentScriptId,
        currentScriptId,
        isMobileSidebarOpen, toggleMobileSidebar
    } = useUIStore()
    const { playReturn } = useAudio()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [isTranscriptOpen, setIsTranscriptOpen] = useState(false)

    // Fetch all scripts for file manager
    const scripts = useLiveQuery(() => db.scripts.orderBy('updatedAt').reverse().toArray())

    const handleNewScript = async () => {
        const id = await db.scripts.add({
            title: 'Untitled',
            author: '',
            content: {
                type: 'doc',
                content: [{ type: 'action', content: [] }]
            },
            createdAt: new Date(),
            updatedAt: new Date()
        })
        setCurrentScriptId(id)
    }

    const handleSwitchScript = (id: number) => {
        if (currentScriptId === id) return
        setCurrentScriptId(id)
    }

    const handleDeleteScript = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation()
        if (confirm('Are you sure you want to delete this script?')) {
            await db.scripts.delete(id)
            if (currentScriptId === id) {
                // If deleted current, switch to another or create new
                const remaining = await db.scripts.orderBy('updatedAt').last()
                if (remaining) {
                    setCurrentScriptId(remaining.id)
                } else {
                    handleNewScript()
                }
            }
        }
    }

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
        <>
            {/* Mobile Overlay Backdrop */}
            {isMobileSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-20 md:hidden"
                    onClick={toggleMobileSidebar}
                />
            )}

            <div className={clsx(
                "fixed left-0 top-0 h-full w-64 flex flex-col p-8 transition-all duration-700 ease-in-out z-30",
                "bg-cream md:bg-transparent shadow-xl md:shadow-none", // Mobile background
                isFocusMode ? "opacity-0 pointer-events-none" : "opacity-100",
                // Mobile visibility
                isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            )}>
                {/* Mobile Close Button */}
                <div className="md:hidden absolute top-4 right-4">
                    <button onClick={toggleMobileSidebar} className="text-ink/40 hover:text-ink text-xl">
                        &times;
                    </button>
                </div>

                {/* File Manager Section */}
                <div className="mb-8 border-b border-ink/10 pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-bold text-xs tracking-widest text-ink/40 uppercase font-sans">Scripts</h2>
                        <button onClick={handleNewScript} className="text-xs font-bold text-ink/50 hover:text-ink uppercase hover:underline">
                            + New
                        </button>
                    </div>
                    <ul className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                        {scripts?.map(script => (
                            <li key={script.id}
                                className={clsx(
                                    "text-xs font-bold cursor-pointer transition-colors duration-200 flex justify-between items-center group",
                                    currentScriptId === script.id ? "text-ink" : "text-ink/60 hover:text-ink"
                                )}
                                onClick={() => {
                                    handleSwitchScript(script.id)
                                    if (window.innerWidth < 768) toggleMobileSidebar()
                                }}
                            >
                                <span className="truncate max-w-[120px]">{script.title || "UNTITLED"}</span>
                                <span
                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 hover:text-red-700 px-1"
                                    onClick={(e) => handleDeleteScript(e, script.id)}
                                >
                                    x
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Scene Strip Section */}
                <h2 className="font-bold mb-6 text-xs tracking-widest text-ink/40 uppercase font-sans">Scene Strip</h2>

                <div className="flex-1 overflow-y-auto mb-6 custom-scrollbar pr-2">
                    {scenes.length === 0 && <p className="text-xs text-ink/30 italic">No scenes yet...</p>}
                    <ul className="space-y-3">
                        {scenes.map((scene, i) => (
                            <li key={i}
                                className="text-xs font-bold text-ink/60 hover:text-ink cursor-pointer transition-colors duration-200 uppercase leading-snug"
                                onClick={() => {
                                    playReturn()
                                    if (window.innerWidth < 768) toggleMobileSidebar()
                                    if (editor) {
                                        const { view } = editor
                                        try {
                                            const dom = view.nodeDOM(scene.pos) as HTMLElement
                                            if (dom) {
                                                dom.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                                editor.chain().focus().setTextSelection(scene.pos + 1).run()
                                            } else {
                                                editor.chain().focus().setTextSelection(scene.pos + 1).scrollIntoView().run()
                                            }
                                        } catch {
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
                    <div className="flex justify-between items-center text-xs font-bold text-ink/50 uppercase">
                        <span>Status</span>
                        <span className={clsx(isSaving ? "text-ink animate-pulse" : "text-ink/50")}>
                            {isSaving
                                ? "Saving..."
                                : `Saved ${scripts?.find(s => s.id === currentScriptId)?.updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}`
                            }
                        </span>
                    </div>

                    <button onClick={() => setIsSettingsOpen(true)} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                        Settings
                    </button>
                    <button onClick={toggleSound} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                        {isSoundEnabled ? 'Sound: On' : 'Sound: Muted'}
                    </button>
                    <button onClick={toggleNightMode} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                        {isNightMode ? 'Mode: Night' : 'Mode: Day'}
                    </button>
                    <button onClick={handlePDF} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                        Export PDF
                    </button>
                    <button onClick={handleJSON} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                        Export JSON
                    </button>
                    <button onClick={() => setIsTranscriptOpen(true)} className="text-xs font-bold text-ink/50 hover:text-ink uppercase flex items-center gap-2">
                        Import Transcript
                    </button>
                </div>
            </div>

            <SettingsDialog isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} key={currentScriptId} />
            <TranscriptImportDialog
                isOpen={isTranscriptOpen}
                onClose={() => setIsTranscriptOpen(false)}
                onImport={(json) => {
                    if (editor) {
                        editor.commands.insertContent(json)
                    }
                }}
            />
        </>
    )
}
