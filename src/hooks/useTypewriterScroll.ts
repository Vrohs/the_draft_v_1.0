import { useRef, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { useAudio } from './useAudio'

export const useTypewriterScroll = (editor: Editor | null) => {
    const { startSlide, stopSlide } = useAudio()
    const isScrollingRef = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)
    // We want to detect manual scroll? 
    // Or just sound when *we* scroll it?
    // "when user is scrolling the page" -> Manual scroll.

    useEffect(() => {
        if (!editor) return

        const handleScroll = () => {
            // Debounce sound
            if (!isScrollingRef.current) {
                startSlide()
                isScrollingRef.current = true
            }

            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                stopSlide()
                isScrollingRef.current = false
            }, 200) // Reset after scroll stops
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [editor, startSlide, stopSlide])
    useEffect(() => {
        if (!editor) return

        const handleSelectionUpdate = () => {
            const { selection } = editor.state
            const { empty } = selection

            // Only scroll if we have a cursor (collapsed selection)
            if (empty) {
                // Use requestAnimationFrame to ensure DOM usage is safe and smooth
                requestAnimationFrame(() => {
                    // We can't easily get the absolute coordinates of the cursor directly from Tiptap without the view 
                    // But editor.view is available.
                    if (!editor.isDestroyed) {
                        const domSelection = editor.view.dom.ownerDocument.getSelection();
                        if (domSelection && domSelection.rangeCount > 0) {
                            const range = domSelection.getRangeAt(0);
                            const rect = range.getBoundingClientRect();

                            // rect.top is relative to viewport
                            // We want rect.top to be at viewport center (window.innerHeight / 2)
                            // Current scroll position = window.scrollY
                            // Target scroll position = currentScroll + (rect.top - window.innerHeight / 2)

                            const middle = window.innerHeight / 2;
                            const offset = rect.top + (rect.height / 2) - middle;

                            if (Math.abs(offset) > 10) { // Threshold to prevent micro-jitters
                                window.scrollBy({
                                    top: offset,
                                    behavior: 'smooth'
                                });
                            }
                        }
                    }
                })
            }
        }

        editor.on('selectionUpdate', handleSelectionUpdate)
        // selectionUpdate triggers on click and typing (cursor move)

        return () => {
            editor.off('selectionUpdate', handleSelectionUpdate)
        }
    }, [editor])
}
