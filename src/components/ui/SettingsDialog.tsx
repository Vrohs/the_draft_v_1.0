import { useState } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { db } from '@/lib/db'

export const SettingsDialog = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const {
        scriptTitle, setScriptTitle,
        scriptAuthor, setScriptAuthor,
        currentScriptId,
        isNightMode
    } = useUIStore()

    const [title, setTitle] = useState(scriptTitle)
    const [author, setAuthor] = useState(scriptAuthor)

    const handleSave = async () => {
        setScriptTitle(title)
        setScriptAuthor(author)

        if (currentScriptId) {
            await db.scripts.update(currentScriptId, {
                title: title,
                author: author,
                updatedAt: new Date()
            })
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
            <div className={`w-96 p-8 rounded-lg shadow-xl ${isNightMode ? 'bg-zinc-900 border border-white/10' : 'bg-white'}`} onClick={(e) => e.stopPropagation()}>
                <h2 className={`text-sm font-bold uppercase tracking-widest mb-6 ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                    Script Settings
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${isNightMode ? 'text-white/60' : 'text-gray-500'}`}>
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full p-2 text-sm font-courier border-b-2 outline-none transition-colors
                                ${isNightMode
                                    ? 'bg-transparent border-white/20 text-white focus:border-white'
                                    : 'bg-transparent border-gray-200 text-gray-900 focus:border-gray-900'
                                }`}
                            placeholder="UNTITLED"
                        />
                    </div>

                    <div>
                        <label className={`block text-xs font-bold uppercase mb-2 ${isNightMode ? 'text-white/60' : 'text-gray-500'}`}>
                            Author
                        </label>
                        <input
                            type="text"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className={`w-full p-2 text-sm font-courier border-b-2 outline-none transition-colors
                                ${isNightMode
                                    ? 'bg-transparent border-white/20 text-white focus:border-white'
                                    : 'bg-transparent border-gray-200 text-gray-900 focus:border-gray-900'
                                }`}
                            placeholder="Author Name"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={onClose}
                        className={`text-xs font-bold uppercase ${isNightMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className={`text-xs font-bold uppercase px-4 py-2 rounded ${isNightMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'}`}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
