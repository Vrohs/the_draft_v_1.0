import { Node, mergeAttributes } from "@tiptap/core";

export const Dialogue = Node.create({
    name: "dialogue",

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
                const { selection } = this.editor.state;
                const { empty, $from } = selection;

                if (!empty) return false;

                // If the dialogue block is empty (user hit enter immediately after creating it, or deleted text)
                const isNodeEmpty = $from.parent.content.size === 0;

                if (isNodeEmpty) {
                    // Transform current empty dialogue to Action
                    return this.editor.commands.setNode("action");
                }

                // If at the end of the line, create a new Character block (Alternating)
                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContentAt(
                        this.editor.state.selection.to,
                        { type: 'character', content: [] }
                    );
                }

                return false;
            },
            Tab: () => {
                // Tab behavior is not strictly defined for Dialogue in PRD.
                // For now, we return false to allow default behavior (or nothing).
                return false;
            },
        };
    },
});
