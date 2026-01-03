import { Node, mergeAttributes } from "@tiptap/core";

export const Dialogue = Node.create({
    name: "dialogue",

    priority: 1000,

    group: "block",

    content: "text*",

    defining: true,

    parseHTML() {
        return [{ tag: "p.sp-dialogue" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["p", mergeAttributes(HTMLAttributes, { class: "sp-dialogue" }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Enter: () => {
                if (!this.editor.isActive('dialogue')) return false

                const { selection } = this.editor.state;
                const { $from, empty } = selection;

                if (!empty) return false;

                if ($from.parent.content.size === 0) {
                    return this.editor.commands.setNode('action');
                }

                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'character' });
                }

                return false;
            },
            Tab: () => {
                return false;
            },
        };
    },
});
