'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
import Focus from '@tiptap/extension-focus'
import { WordFocus } from './extensions/WordFocus'
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
import { FocusVignette } from '../ui/FocusVignette'
import { ReflectionCompanion } from '../ui/ReflectionCompanion'
import { useAudio } from '@/hooks/useAudio'
import { db } from '@/lib/db'
import { useAutosave } from '@/hooks/useAutosave'
import { getTimeContext } from '@/lib/gemini'

export default function Editor() {
    const { isFocusMode, setFocusMode, isNightMode, isWordFocusMode, isReflectionMode, currentTheme, currentScriptId, setCurrentScriptId, setScriptTitle, setScriptAuthor, scriptTitle, scriptAuthor, toggleMobileSidebar } = useUIStore()
    const { playClack, playReturn } = useAudio()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isTyping, setIsTyping] = useState(false)
    const [editorContent, setEditorContent] = useState('')
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)


    const playReturnRef = useRef(playReturn)
    const playClackRef = useRef(playClack)
    const isEnterRef = useRef(false)

    useEffect(() => {
        if (isNightMode) {
            document.body.classList.add('night-mode')
        } else {
            document.body.classList.remove('night-mode')
        }
    }, [isNightMode])

    useEffect(() => {
        if (isFocusMode) {
            document.body.classList.add('focus-mode')
        } else {
            document.body.classList.remove('focus-mode')
        }
    }, [isFocusMode])

    useEffect(() => {
        if (isWordFocusMode) {
            document.body.classList.add('word-focus-mode')
        } else {
            document.body.classList.remove('word-focus-mode')
        }
    }, [isWordFocusMode])

    useEffect(() => {
        document.body.classList.remove('theme-dawn', 'theme-sepia', 'theme-fog', 'theme-forest')
        if (currentTheme !== 'default') {
            document.body.classList.add(`theme-${currentTheme}`)
        }
    }, [currentTheme])

    useEffect(() => {
        if (isReflectionMode) {
            document.body.classList.add('reflection-mode')
            const time = getTimeContext()
            document.body.classList.remove('time-morning', 'time-afternoon', 'time-evening', 'time-night')
            document.body.classList.add(`time-${time}`)
        } else {
            document.body.classList.remove('reflection-mode', 'time-morning', 'time-afternoon', 'time-evening', 'time-night')
        }
    }, [isReflectionMode])

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
            Focus.configure({
                className: 'has-focus',
                mode: 'deepest',
            }),
            WordFocus,
            Action,
            Slugline,
            Character,
            Dialogue,
            Parenthetical,
            Transition
        ],
        content: {
            type: 'doc',
            content: [
                {
                    type: 'action',
                    content: []
                }
            ]
        },
        editorProps: {
            attributes: {
                class: 'outline-none prose prose-lg font-courier max-w-[8.5in] w-full mx-auto px-12 py-24 focus:outline-none focus:ring-0 print:p-0 print:max-w-none',
            },
            handleKeyDown: (view, event) => {
                if (event.key === 'Enter') {
                    playReturnRef.current()
                    isEnterRef.current = true
                    return false
                }
                isEnterRef.current = false
                return false
            }
        },
        onUpdate: ({ editor }) => {
            setEditorContent(editor.getText())
        },
        onTransaction: ({ transaction }) => {
            if (transaction.docChanged) {
                setFocusMode(true)

                if (!transaction.getMeta('preventSound')) {
                    if (isEnterRef.current) {
                        isEnterRef.current = false
                    } else {
                        playClackRef.current()
                    }
                }

                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => {
                    setFocusMode(false)
                }, 3000)

                setIsTyping(true)
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
                typingTimeoutRef.current = setTimeout(() => {
                    setIsTyping(false)
                }, 2000)
            }
        }
    })

    useEffect(() => {
        const initDB = async () => {
            if (currentScriptId) return

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

    useEffect(() => {
        const loadScript = async () => {
            if (!editor || !currentScriptId) return

            const script = await db.scripts.get(currentScriptId)
            if (script && script.content) {
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
            <div className="fixed top-4 left-4 z-20 md:hidden print:hidden mix-blend-difference">
                <button
                    onClick={toggleMobileSidebar}
                    className="p-2 text-ink/50 hover:text-ink uppercase font-bold text-xs"
                >
                    Menu
                </button>
            </div>

            <Sidebar editor={editor} />
            <FocusVignette />
            <ReflectionCompanion editorContent={editorContent} isTyping={isTyping} />
            <div className="max-w-[100vw] flex justify-center md:pl-64 transition-all duration-300">
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    )
}
