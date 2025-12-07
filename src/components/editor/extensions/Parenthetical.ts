import { Node, mergeAttributes } from "@tiptap/core";

export const Parenthetical = Node.create({
    name: "parenthetical",

    priority: 1000,

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
                if (!this.editor.isActive('parenthetical')) return false

                const { selection } = this.editor.state;
                const { $from, empty } = selection;

                if (!empty) return false;

                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'dialogue' });
                }

                return false;
            },
        };
    },
});
