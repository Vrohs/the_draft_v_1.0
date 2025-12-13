'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import { Slugline } from './extensions/Slugline'
import { Action } from './extensions/Action'
import { Character } from './extensions/Character'
import { Dialogue } from './extensions/Dialogue'
import { Parenthetical } from './extensions/Parenthetical'
import { Transition } from './extensions/Transition'
import { useEffect, useRef } from 'react'
import { useTypewriterScroll } from '@/hooks/useTypewriterScroll'
import { useUIStore } from '@/store/useUIStore'
import { Sidebar } from '../ui/Sidebar'
import { useAudio } from '@/hooks/useAudio'
import { db } from '@/lib/db'
import { useAutosave } from '@/hooks/useAutosave'

export default function Editor() {
    const { setFocusMode, isNightMode, currentScriptId, setCurrentScriptId, setScriptTitle, setScriptAuthor, scriptTitle, scriptAuthor } = useUIStore()
    const { playClack, playReturn } = useAudio()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)


    // Refs for stable access in Tiptap closures without re-init
    const playReturnRef = useRef(playReturn)
    const playClackRef = useRef(playClack)
    const isEnterRef = useRef(false)

    // Toggle Night Mode class
    useEffect(() => {
        if (isNightMode) {
            document.body.classList.add('night-mode')
        } else {
            document.body.classList.remove('night-mode')
        }
    }, [isNightMode])

    useEffect(() => {
        playReturnRef.current = playReturn
        playClackRef.current = playClack
    }, [playReturn, playClack])

    useEffect(() => {
        playReturn()
    }, [playReturn])

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            Document,
            Text,
            History,
            Action, // Default block (Standard Paragraph)
            Slugline,
            Character,
            Dialogue,
            Parenthetical,
            Transition
        ],
        // Initial content: explicit Action block to ensure "Standard" text by default.
        content: {
            type: 'doc',
            content: [
                {
                    type: 'action', // This ensures we start with 'Action' (Sentence case), not Slugline.
                    content: []
                }
            ]
        },
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-lg font-courier max-w-[8.5in] w-full mx-auto px-12 py-24 focus:outline-none focus:ring-0 print:p-0 print:max-w-none',
                // Added print styles and forced font
            },
            handleKeyDown: (view, event) => {
                if (event.key === 'Enter') {
                    playReturnRef.current()
                    isEnterRef.current = true
                    // We don't return true, we want the editor to handle the Enter key (new line/block)
                    return false
                }
                isEnterRef.current = false
                return false
            }
        },
        onUpdate: () => {
            // We don't persist here manually anymore, useAutosave does it.
        },
        onTransaction: ({ transaction }) => {
            if (transaction.docChanged) {
                setFocusMode(true)

                // Precise Audio Logic
                // Only play clack if text was inserted/deleted by user typing
                // We verify this by checking if it's not just a selection change and if metadata isn't "programmatic"
                // But specifically for "user types (a-z...)"

                // transaction.getMeta('inputType') might help if Tiptap sets it, but usually not reliable.
                // We check if content changed.

                // Exclude "programmatic" SetContent calls (like from localStorage loading)
                // We can check if `transaction.time` is recent? No.

                // When we load content, we set hydrated=true.
                // We should ensure we don't clack on initial load.
                // Initial load is done via editor.commands.setContent which triggers transaction.

                // Let's assume standard typing creates steps.
                if (!transaction.getMeta('preventSound')) {
                    // If we just pressed Enter, we played Return. Avoid Clack?
                    // onTransaction fires AFTER the keydown usually.
                    if (isEnterRef.current) {
                        // Reset and skip clack
                        isEnterRef.current = false
                    } else {
                        playClackRef.current()
                    }
                }

                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => {
                    setFocusMode(false)
                }, 3000)
            }
        }
    })

    // Initialize DB: Load last script or create new one
    useEffect(() => {
        const initDB = async () => {
            if (currentScriptId) return // Already loaded

            const count = await db.scripts.count()
            if (count > 0) {
                const lastScript = await db.scripts.orderBy('updatedAt').last()
                if (lastScript) {
                    setCurrentScriptId(lastScript.id)
                    setScriptTitle(lastScript.title)
                    setScriptAuthor(lastScript.author)
                    if (editor && !editor.isDestroyed) {
                        editor.chain().setContent(lastScript.content).setMeta('preventSound', true).run()
                    }
                }
            } else {
                // Create default script
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
                setScriptTitle('Untitled')
                setScriptAuthor('')
            }
        }
        initDB()
    }, [currentScriptId, setCurrentScriptId, setScriptTitle, setScriptAuthor, editor])

    // Load content when switching scripts (if editor exists)
    useEffect(() => {
        const loadScript = async () => {
            if (!editor || !currentScriptId) return

            // Check if we already have the correct content? 
            // Actually, we should force load if the ID changed.
            // But we need to avoid overwriting if we just typed?
            // This is complex. Simplification: Only load if editor content is empty or different?
            // Better: Trust the DB as source of truth on switch.

            const script = await db.scripts.get(currentScriptId)
            if (script && script.content) {
                // simple check to avoid reload loops if we just saved?
                // For now, unconditional load on ID change is safer for "Switching".
                // We need to make sure this doesn't run on every render.
                // It runs when `currentScriptId` changes.

                // We also need to prevent this from overwriting unsaved changes if we switch? 
                // Architecture assumes autosave is fast enough or we don't switch unsaved.
                // We will assume autosave handles it.

                // Only set content if it's different to avoid cursor jumps?
                // Tiptap setContent usually resets cursor.
                // For this MVP, we assume switching scripts happens rarely and resets view.
                editor.chain().setContent(script.content).setMeta('preventSound', true).run()
                setScriptTitle(script.title)
                setScriptAuthor(script.author)
            }
        }
        loadScript()
    }, [currentScriptId, editor, setScriptTitle, setScriptAuthor])


    useAutosave(editor, currentScriptId)
    useTypewriterScroll(editor)


    useEffect(() => {
        const handleMouseMove = () => {
            setFocusMode(false)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
        window.addEventListener('mousemove', handleMouseMove)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [setFocusMode])

    if (!editor) {
        return null
    }

    return (
        <div className="min-h-screen w-full bg-cream cursor-text relative" onClick={() => editor.chain().focus().run()}>
            <div className="print-title-page">
                <h1 className="font-courier text-4xl font-bold uppercase mb-4 tracking-widest">{scriptTitle || "UNTITLED"}</h1>
                <p className="font-courier text-xl mb-2">by</p>
                <p className="font-courier text-xl mb-4">{scriptAuthor || "Author Name"}</p>
            </div>
            <Sidebar editor={editor} />
            <div className="max-w-[100vw] flex justify-center">
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    )
}
