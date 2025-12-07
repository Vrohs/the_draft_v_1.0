import { Node, mergeAttributes } from "@tiptap/core";

export const Transition = Node.create({
    name: "transition",

    priority: 1000,

    group: "block",

    content: "text*",

    defining: true,

    parseHTML() {
        return [{ tag: "p.sp-transition" }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "p",
            mergeAttributes(HTMLAttributes, { class: "sp-transition" }),
            0,
        ];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                if (!this.editor.isActive('transition')) return false

                const { selection } = this.editor.state;
                const { $from, empty } = selection;

                if (!empty) return false;

                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'slugline' });
                }

                return false;
            },
        };
    },
});
