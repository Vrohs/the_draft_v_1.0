import { Node, mergeAttributes } from "@tiptap/core";

export const Action = Node.create({
    name: "action",

    group: "block",

    content: "text*",

    defining: true,

    parseHTML() {
        return [{ tag: "p.sp-action" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["p", mergeAttributes(HTMLAttributes, { class: "sp-action" }), 0];
    },

    addKeyboardShortcuts() {
        return {
            Tab: () => {
                // Transform to Character
                return this.editor.commands.setNode("character");
            },
        };
    },
});
