import { Node, mergeAttributes } from "@tiptap/core";

export const Character = Node.create({
    name: "character",

    group: "block",

    content: "text*",

    defining: true,

    parseHTML() {
        return [{ tag: "p.sp-character" }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "p",
            mergeAttributes(HTMLAttributes, { class: "sp-character" }),
            0,
        ];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                return this.editor.commands.insertContentAt(
                    this.editor.state.selection.to,
                    { type: 'dialogue', content: [] }
                );
            },
            Tab: () => {
                // Maybe Tab moves back to Action? Or Transition?
                // PRD doesn't specify reverse.
                return false;
            }
        };
    },
});
