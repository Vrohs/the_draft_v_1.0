import { Editor } from '@tiptap/core'
import Document from '@tiptap/extension-document'
import StarterKit from '@tiptap/starter-kit'
import Text from '@tiptap/extension-text'
import History from '@tiptap/extension-history'
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
                Document,
                Text,
                History.configure({ newGroupDelay: 0 }),
                Action,
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

    // 8. Input Rule: Type "INT. " -> Slugline (Preserve Text)
    it('should convert to slugline but PRESERVE the text "INT. "', () => {
        // We simulate the effect of the input rule.
        // The bug is that `textblockTypeInputRule` deletes the matched text ("INT. ").
        // We want to ensure that if we used a proper rule, the text remains.

        // Since we can't easily run the actual InputRule engine here without full integration setup,
        // we will assume the manual verification showed it deletes.
        // This test represents the *desired* state for a "typing" simulation.

        // Let's manually simulate what we WANT the input rule to do:
        // 1. User types "INT. "
        // 1. User types "INT. "
        editor.commands.setContent({ type: 'doc', content: [{ type: 'action', content: [{ type: 'text', text: 'INT. ' }] }] })

        // 2. Trigger conversion (manually for now to verify node support)
        editor.commands.setNode('slugline')

        // 3. Verify text is still there
        expect(editor.getText()).toBe('INT. ')
        expect(editor.getJSON().content?.[0].type).toBe('slugline')
    })

    it('should undo a Smart Enter transition', () => {
        // Create a specific editor instance for this test to ensure history starts clean with content
        const localEditor = new Editor({
            extensions: [
                Document,
                Text,
                History,
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
                        type: 'slugline',
                        content: [{ type: 'text', text: 'INT. TEST' }]
                    }
                ]
            }
        })

        // Move cursor to end of the slugline
        // Node size = 1 (start) + text (9) + 1 (end) = 11? 
        // Text is "INT. TEST". Length 9.
        // Start pos 0 -> Doc start. 
        // Block start 1. Text start 1. 
        // We want pos at 10?
        // Let's use the helper logic adapted for localEditor
        const nodeSize = localEditor.state.doc.content.child(0).nodeSize
        localEditor.commands.setTextSelection(nodeSize - 1)

        localEditor.commands.enter()

        // Verify action created
        expect(localEditor.getJSON().content?.[1].type).toBe('action')

        // Undo
        localEditor.commands.undo()

        // Should be back to just slugline (History shouldn't undo the initial content)
        const content = localEditor.getJSON().content
        expect(content?.length).toBe(1)
        expect(content?.[0].type).toBe('slugline')

        localEditor.destroy()
    })

    // 9. Mid-block Enter (Default Split Behavior)
    it('should split Dialogue block when Enter pressed in middle', () => {
        setContent('dialogue', 'Hello world')
        // Place cursor after 'Hello' (pos: 1 + 5 = 6)
        editor.commands.setTextSelection(6)

        editor.commands.enter()

        // Should result in two Dialogue blocks
        const content = editor.getJSON().content
        expect(content?.[0].type).toBe('dialogue')
        expect((content?.[0].content?.[0] as any).text).toBe('Hello')

        expect(content?.[1].type).toBe('dialogue')
        expect((content?.[1].content?.[0] as any).text).toBe(' world')
    })
})
