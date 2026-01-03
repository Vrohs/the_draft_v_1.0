'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUIStore } from '@/store/useUIStore'
import { generateReflectionPrompt, getTimeContext } from '@/lib/gemini'
import clsx from 'clsx'

interface ReflectionCompanionProps {
    editorContent: string
    isTyping: boolean
}

export const ReflectionCompanion = ({ editorContent, isTyping }: ReflectionCompanionProps) => {
    const { isReflectionMode } = useUIStore()
    const [prompt, setPrompt] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const [lastContentLength, setLastContentLength] = useState(0)

    const fetchPrompt = useCallback(async (content: string) => {
        if (!content.trim() || content.length < 20) {
            setPrompt('')
            return
        }

        setIsLoading(true)
        try {
            const recentText = content.slice(-500)
            const newPrompt = await generateReflectionPrompt(recentText)
            setPrompt(newPrompt)
            setIsVisible(true)
        } catch (error) {
            console.error('Error fetching prompt:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!isReflectionMode) {
            setIsVisible(false)
            return
        }

        if (isTyping) {
            setIsVisible(false)
            return
        }

        const contentChanged = Math.abs(editorContent.length - lastContentLength) > 10

        if (contentChanged && editorContent.length > 20) {
            const timer = setTimeout(() => {
                fetchPrompt(editorContent)
                setLastContentLength(editorContent.length)
            }, 5000)

            return () => clearTimeout(timer)
        }
    }, [isTyping, editorContent, isReflectionMode, fetchPrompt, lastContentLength])

    useEffect(() => {
        if (isTyping && isVisible) {
            setIsVisible(false)
        }
    }, [isTyping, isVisible])

    if (!isReflectionMode) return null

    const timeOfDay = getTimeContext()
    const timeEmoji = {
        morning: '🌅',
        afternoon: '☀️',
        evening: '🌇',
        night: '🌙'
    }[timeOfDay]

    return (
        <div
            className={clsx(
                "fixed bottom-8 left-1/2 -translate-x-1/2 max-w-md transition-all duration-700 ease-out z-50",
                isVisible && prompt ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
            )}
        >
            <div className="bg-cream/95 backdrop-blur-sm border border-ink/10 rounded-2xl px-6 py-4 shadow-lg">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-ink/40">
                        <span className="animate-pulse">●</span>
                        <span className="text-sm italic">listening...</span>
                    </div>
                ) : (
                    <div className="flex items-start gap-3">
                        <span className="text-xl">{timeEmoji}</span>
                        <p className="text-sm text-ink/80 leading-relaxed font-serif italic">
                            {prompt}
                        </p>
                    </div>
                )}
            </div>

            {isVisible && prompt && (
                <p className="text-center text-[10px] text-ink/30 mt-2">
                    just start writing to continue
                </p>
            )}
        </div>
    )
}
