import { Node, mergeAttributes } from "@tiptap/core";

export const Character = Node.create({
    name: "character",

    priority: 1000,

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
                if (!this.editor.isActive('character')) return false

                const { selection } = this.editor.state;
                const { $from, empty } = selection;

                if (!empty) return false;

                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'dialogue' });
                }

                return false;
            },
            Tab: () => {
                // Maybe Tab moves back to Action? Or Transition?
                // PRD doesn't specify reverse.
                return false;
            }
        };
    },
});
