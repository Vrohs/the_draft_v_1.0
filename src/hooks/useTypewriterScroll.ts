import { useRef, useEffect } from 'react'
import { Editor } from '@tiptap/react'
import { useAudio } from './useAudio'

export const useTypewriterScroll = (editor: Editor | null) => {
    const { startSlide, stopSlide } = useAudio()
    const isScrollingRef = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        if (!editor) return

        const handleScroll = () => {
            if (!isScrollingRef.current) {
                startSlide()
                isScrollingRef.current = true
            }

            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => {
                stopSlide()
                isScrollingRef.current = false
            }, 200)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [editor, startSlide, stopSlide])
    useEffect(() => {
        if (!editor) return

        const handleSelectionUpdate = () => {
            const { selection } = editor.state
            const { empty } = selection

            if (empty) {
                requestAnimationFrame(() => {
                    if (!editor.isDestroyed) {
                        const domSelection = editor.view.dom.ownerDocument.getSelection();
                        if (domSelection && domSelection.rangeCount > 0) {
                            const range = domSelection.getRangeAt(0);
                            const rect = range.getBoundingClientRect();

                            const middle = window.innerHeight / 2;
                            const offset = rect.top + (rect.height / 2) - middle;

                            if (Math.abs(offset) > 10) {
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

        return () => {
            editor.off('selectionUpdate', handleSelectionUpdate)
        }
    }, [editor])
}
