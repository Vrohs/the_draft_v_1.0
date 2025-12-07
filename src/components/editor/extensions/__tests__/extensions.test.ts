import { Editor } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Slugline } from '../Slugline'
import { Action } from '../Action'
import { Character } from '../Character'
import { Dialogue } from '../Dialogue'
import { Parenthetical } from '../Parenthetical'
import { Transition } from '../Transition'

describe('Screenplay Extensions', () => {
    let editor: Editor

    beforeEach(() => {
        editor = new Editor({
            extensions: [
                StarterKit,
                Action, // Match Editor.tsx order
                Slugline,
                Character,
                Dialogue,
                Parenthetical,
                Transition
            ],
        })
    })

    // Helper to set content strictly
    const setContent = (type: string, text: string = '') => {
        editor.commands.setContent({
            type: 'doc',
            content: [
                {
                    type: type,
                    content: text ? [{ type: 'text', text }] : []
                }
            ]
        })
    }

    // Helper for Dialogue/Character setup
    const setContentSequence = (nodes: { type: string, text: string }[]) => {
        editor.commands.setContent({
            type: 'doc',
            content: nodes.map(n => ({
                type: n.type,
                content: n.text ? [{ type: 'text', text: n.text }] : []
            }))
        })
    }

    // Helper to place cursor at the end of the first block
    const focusEndOfFirstBlock = () => {
        const firstNodeSize = editor.state.doc.content.child(0).nodeSize
        // Position is start (0) + 1 (open tag) + content size? 
        // Actually nodeSize includes tags. 
        // content size = nodeSize - 2 (for simple blocks).
        // resolvedPos(nodeSize - 1) should be inside.
        editor.commands.setTextSelection(firstNodeSize - 1)
    }

    // Helper to place cursor at end of second block
    const focusEndOfSecondBlock = () => {
        const firstNodeSize = editor.state.doc.content.child(0).nodeSize
        const secondNodeSize = editor.state.doc.content.child(1).nodeSize
        editor.commands.setTextSelection(firstNodeSize + secondNodeSize - 1)
    }

    // 1. Slugline -> Enter -> Action
    it('should transition from Slugline to Action on Enter', () => {
        setContent('slugline', 'INT. TEST - DAY')
        focusEndOfFirstBlock()
        editor.commands.enter()

        // Check if a NEW block was inserted after Slugline (at index 1)
        // content[0] = Slugline
        // content[1] = Action (new)
        expect(editor.getJSON().content?.[1].type).toBe('action')
    })

    // 2. Action -> Tab -> Character
    it('should transition from Action to Character on Tab', () => {
        setContent('action', 'Some action text')

        // Simulate Tab key press since there's no editor.commands.tab()
        // We use the low-level ProseMirror view prop handler
        editor.view.someProp('handleKeyDown', (f: any) => f(editor.view, new KeyboardEvent('keydown', { key: 'Tab' })))

        // Content should now be 'character'
        expect(editor.getJSON().content?.[0].type).toBe('character')
    })

    // 3. Character -> Enter -> Dialogue
    it('should transition from Character to Dialogue on Enter', () => {
        setContent('character', 'HERO')
        focusEndOfFirstBlock()
        editor.commands.enter()

        expect(editor.getJSON().content?.[1].type).toBe('dialogue')
    })

    // 4. Dialogue -> Enter -> Character (Alternating)
    it('should transition from Dialogue to Character on Enter', () => {
        setContentSequence([
            { type: 'character', text: 'HERO' },
            { type: 'dialogue', text: 'Hello there.' }
        ])
        focusEndOfSecondBlock()
        editor.commands.enter()

        expect(editor.getJSON().content?.[2].type).toBe('character')
    })

    // 5. Dialogue -> Double Enter (Empty) -> Action
    it('should transition from empty Dialogue to Action on Enter', () => {
        setContentSequence([
            { type: 'character', text: 'HERO' },
            { type: 'dialogue', text: '' } // Empty dialogue
        ])
        // Focus end of empty dialogue (second block)
        // Empty block size is 2 (open + close).
        // pos = firstNodeSize + 1 (start of second) + 0 (content) -> firstNodeSize + 1.
        const firstNodeSize = editor.state.doc.content.child(0).nodeSize
        editor.commands.setTextSelection(firstNodeSize + 1)

        editor.commands.enter()

        // The second block (index 1) should transform to Action
        expect(editor.getJSON().content?.[1].type).toBe('action')
    })

    // 6. Parenthetical -> Enter -> Dialogue
    it('should transition from Parenthetical to Dialogue on Enter', () => {
        setContent('parenthetical', '(beat)')
        focusEndOfFirstBlock()
        editor.commands.enter()

        expect(editor.getJSON().content?.[1].type).toBe('dialogue')
    })

    // 7. Transition -> Enter -> Slugline
    it('should transition from Transition to Slugline on Enter', () => {
        setContent('transition', 'CUT TO:')
        focusEndOfFirstBlock()
        editor.commands.enter()

        expect(editor.getJSON().content?.[1].type).toBe('slugline')
    })
})
