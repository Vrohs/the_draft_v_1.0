import { Node, mergeAttributes } from "@tiptap/core";

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
});
