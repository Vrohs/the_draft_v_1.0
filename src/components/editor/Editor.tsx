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
import { useEffect, useRef, useState } from 'react'
import { useTypewriterScroll } from '@/hooks/useTypewriterScroll'
import { useUIStore } from '@/store/useUIStore'
import { Sidebar } from '../ui/Sidebar'
import { useAudio } from '@/hooks/useAudio'

export default function Editor() {
    const { setFocusMode, isNightMode } = useUIStore()
    const { playClack, playReturn } = useAudio()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [hydrated, setHydrated] = useState(false)

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
        setHydrated(true)
        playReturn()
    }, [playReturn])

    // We need to ensure that if the document is created fresh, it starts with an Action block, not Slugline.
    // Tiptap's `content` prop is used on initialization.
    // If I want to verify "Capital letters by Default is not good", I need to ensure the first block is Action.

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
        onUpdate: ({ editor }) => {
            // Persist
            const json = editor.getJSON()
            if (typeof window !== 'undefined') {
                localStorage.setItem('draft_content', JSON.stringify(json))
            }
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

    // Load persistence
    useEffect(() => {
        if (editor && hydrated) {
            const stored = localStorage.getItem('draft_content')
            if (stored) {
                try {
                    const json = JSON.parse(stored)
                    // If stored content is empty or invalid, keep default.
                    // But check if it has content.
                    editor.commands.setContent(json)
                    // We set content but we don't want to trigger the sound.
                    // Actually, `setContent` triggers a transaction.
                    // We can't easily pass meta to `setContent` in all Tiptap versions directly as a second arg object?
                    // Correction: editor.commands.setContent(content, emitUpdate, parseOptions) - doesn't take meta.
                    // Better approach: Use chain().setContent(json).setMeta('preventSound', true).run()
                    editor.chain().setContent(json).setMeta('preventSound', true).run()
                } catch (e) {
                    // ignore
                }
            }
        }
    }, [editor, hydrated])

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
            <Sidebar editor={editor} />
            <div className="max-w-[100vw] flex justify-center">
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    )
}
