import { Node, mergeAttributes, InputRule } from "@tiptap/core";

export const Slugline = Node.create({
    name: "slugline",

    priority: 1000, // Ensure shortcuts take precedence

    group: "block",

    content: "text*",

    marks: "", // No bold/italic allowed in sluglines usually, but can be relaxed. PRD implied simple formatting.

    defining: true,

    parseHTML() {
        return [{ tag: "h3.sp-slugline" }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "h3",
            mergeAttributes(HTMLAttributes, { class: "sp-slugline" }),
            0,
        ];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                if (!this.editor.isActive('slugline')) return false

                const { selection } = this.editor.state;
                const { $from, empty } = selection;

                if (!empty) return false;

                // If at end of line, create Action
                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'action' });
                }

                return false; // Default split behavior
            },
        };
    },

    addInputRules() {
        return [
            new InputRule({
                find: /^(?:INT|EXT|EST|INT\.\/EXT|I\/E)\.\s$/i,
                handler: ({ state, range, match }: { state: any, range: any, match: any }) => {
                    const { tr } = state
                    const start = range.from
                    const end = range.to

                    // 1. Change the block type to slugline
                    tr.setBlockType(start, end, this.type)

                    // 2. InputRule handler is fully responsible.
                    //    If we don't delete the range, the existing text ("INT. ") remains.
                    //    We just want to change the visual block type.
                    //    So we do NOT delete, and we do NOT insert (which would duplicate).

                    return tr
                }
            }),
            // Let's use the helper `textblockTypeInputRule` but try to override it? No.
            // Let's build a raw InputRule.
        ]
    },
});
