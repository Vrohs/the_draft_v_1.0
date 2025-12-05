import { Node, mergeAttributes } from "@tiptap/core";

export const Transition = Node.create({
    name: "transition",

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
                // Transition -> Slugline (Usually)
                return this.editor.commands.insertContentAt(
                    this.editor.state.selection.to,
                    { type: 'slugline', content: [] }
                );
            },
        };
    },
});
