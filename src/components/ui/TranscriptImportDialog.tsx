
import { useState } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { parseTranscript, SceneDetails, CharacterMap } from '@/lib/transcriptParser'
import { JSONContent } from '@tiptap/react'

interface TranscriptImportDialogProps {
    isOpen: boolean
    onClose: () => void
    onImport: (content: JSONContent) => void
}

export const TranscriptImportDialog = ({ isOpen, onClose, onImport }: TranscriptImportDialogProps) => {
    const { isNightMode } = useUIStore()

    // Scene Details State
    const [intExt, setIntExt] = useState<'INT.' | 'EXT.'>('INT.')
    const [location, setLocation] = useState('')
    const [time, setTime] = useState<'DAY' | 'NIGHT'>('DAY')

    // Transcript State
    const [transcript, setTranscript] = useState('')

    // Character Map State
    const [characterMap, setCharacterMap] = useState<{ from: string, to: string }[]>([
        { from: '', to: '' }
    ])

    const handleAddMapRow = () => {
        setCharacterMap([...characterMap, { from: '', to: '' }])
    }

    const handleMapChange = (index: number, field: 'from' | 'to', value: string) => {
        const newMap = [...characterMap]
        newMap[index][field] = value
        setCharacterMap(newMap)
    }

    const handleImportClick = () => {
        // Construct map object
        const mapObj: CharacterMap = {}
        characterMap.forEach(row => {
            if (row.from && row.to) {
                mapObj[row.from] = row.to.toUpperCase()
            }
        })

        const sceneDetails: SceneDetails = {
            intExt,
            location,
            time
        }

        const json = parseTranscript(transcript, sceneDetails, mapObj)
        onImport(json)
        onClose()

        // Reset sensitive fields
        setTranscript('')
        setLocation('')
    }

    if (!isOpen) return null

    const inputClass = `w-full p-2 text-sm font-courier border-b-2 outline-none transition-colors ${isNightMode
            ? 'bg-transparent border-white/20 text-white focus:border-white'
            : 'bg-transparent border-gray-200 text-gray-900 focus:border-gray-900'
        }`

    const labelClass = `block text-xs font-bold uppercase mb-2 ${isNightMode ? 'text-white/60' : 'text-gray-500'
        }`

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8 rounded-lg shadow-xl flex flex-col gap-6 custom-scrollbar ${isNightMode ? 'bg-zinc-900 border border-white/10' : 'bg-white'
                }`}>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className={`text-sm font-bold uppercase tracking-widest ${isNightMode ? 'text-white' : 'text-gray-900'}`}>
                        Import Transcript
                    </h2>
                    <button onClick={onClose} className={`text-xl ${isNightMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}>
                        &times;
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* LEFT COLUMN: Scene & Map */}
                    <div className="space-y-6">
                        {/* Scene Heading */}
                        <div className="space-y-4 border-b border-gray-200/10 pb-4">
                            <h3 className={`text-xs font-bold uppercase tracking-wider ${isNightMode ? 'text-white/40' : 'text-gray-400'}`}>1. Scene Heading</h3>
                            <div className="grid grid-cols-4 gap-2">
                                <div className="col-span-1">
                                    <select
                                        value={intExt}
                                        onChange={(e) => setIntExt(e.target.value as 'INT.' | 'EXT.')}
                                        className={inputClass}
                                    >
                                        <option value="INT.">INT.</option>
                                        <option value="EXT.">EXT.</option>
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="text"
                                        placeholder="LOCATION"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className={inputClass}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <select
                                        value={time}
                                        onChange={(e) => setTime(e.target.value as 'DAY' | 'NIGHT')}
                                        className={inputClass}
                                    >
                                        <option value="DAY">DAY</option>
                                        <option value="NIGHT">NIGHT</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Character Map */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className={`text-xs font-bold uppercase tracking-wider ${isNightMode ? 'text-white/40' : 'text-gray-400'}`}>2. Character Mapping</h3>
                                <button onClick={handleAddMapRow} className="text-[10px] uppercase font-bold text-blue-500 hover:underline">+ Add Row</button>
                            </div>

                            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-2">
                                {characterMap.map((row, i) => (
                                    <div key={i} className="flex gap-2 items-center">
                                        <input
                                            placeholder="Transcript Name"
                                            value={row.from}
                                            onChange={(e) => handleMapChange(i, 'from', e.target.value)}
                                            className={`${inputClass} text-xs`}
                                        />
                                        <span className={isNightMode ? 'text-white/20' : 'text-gray-300'}>→</span>
                                        <input
                                            placeholder="Script Name"
                                            value={row.to}
                                            onChange={(e) => handleMapChange(i, 'to', e.target.value)}
                                            className={`${inputClass} text-xs`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className={`text-[10px] italic ${isNightMode ? 'text-white/30' : 'text-gray-400'}`}>
                                Maps names found in transcript (e.g. "Vivek") to Screenplay Characters (e.g. "VIVEK").
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Transcript Input */}
                    <div className="flex flex-col h-full min-h-[300px]">
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-4 ${isNightMode ? 'text-white/40' : 'text-gray-400'}`}>3. Paste Transcript</h3>
                        <textarea
                            value={transcript}
                            onChange={(e) => setTranscript(e.target.value)}
                            className={`flex-1 w-full p-4 text-xs font-mono rounded resize-none border focus:outline-none transition-colors
                                ${isNightMode
                                    ? 'bg-black/20 border-white/10 text-white/80 focus:border-white/30'
                                    : 'bg-gray-50 border-gray-200 text-gray-700 focus:border-gray-400'
                                }`}
                            placeholder={`Example:\nVivek: How are you?\nGemini: I am good.`}
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 border-t border-gray-200/10 pt-6">
                    <button
                        onClick={onClose}
                        className={`text-xs font-bold uppercase ${isNightMode ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleImportClick}
                        disabled={!location || !transcript}
                        className={`text-xs font-bold uppercase px-6 py-2 rounded transition-opacity
                            ${!location || !transcript ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}
                            ${isNightMode ? 'bg-white text-black' : 'bg-black text-white'}`}
                    >
                        Import Script
                    </button>
                </div>
            </div>
        </div>
    )
}
