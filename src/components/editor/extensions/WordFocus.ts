import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'

export const WordFocus = Extension.create({
    name: 'wordFocus',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('wordFocus'),
                props: {
                    decorations(state) {
                        const { doc, selection } = state
                        const { from } = selection

                        if (!selection.empty) return DecorationSet.empty

                        const $pos = doc.resolve(from)
                        const textContent = $pos.parent.textContent

                        if (!textContent) return DecorationSet.empty

                        const offset = from - $pos.start()

                        let wordStart = offset
                        let wordEnd = offset

                        while (wordStart > 0 && !/\s/.test(textContent[wordStart - 1])) {
                            wordStart--
                        }

                        while (wordEnd < textContent.length && !/\s/.test(textContent[wordEnd])) {
                            wordEnd++
                        }

                        if (wordStart === wordEnd) return DecorationSet.empty

                        const decorationStart = $pos.start() + wordStart
                        const decorationEnd = $pos.start() + wordEnd

                        const decoration = Decoration.inline(decorationStart, decorationEnd, {
                            class: 'current-word'
                        })

                        return DecorationSet.create(doc, [decoration])
                    }
                }
            })
        ]
    }
})
