import { Node, mergeAttributes } from "@tiptap/core";

export const Parenthetical = Node.create({
    name: "parenthetical",

    group: "block",

    content: "text*",

    defining: true,

    parseHTML() {
        return [{ tag: "p.sp-parenthetical" }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "p",
            mergeAttributes(HTMLAttributes, { class: "sp-parenthetical" }),
            0,
        ];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                // Parenthetical always leads back to Dialogue
                return this.editor.commands.insertContentAt(
                    this.editor.state.selection.to,
                    { type: 'dialogue', content: [] }
                );
            },
        };
    },
});
