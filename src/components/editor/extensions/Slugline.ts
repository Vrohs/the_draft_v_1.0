import { Node, mergeAttributes } from "@tiptap/core";

export const Slugline = Node.create({
    name: "slugline",

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
                // Create a new Action block after this
                return this.editor.commands.insertContentAt(
                    this.editor.state.selection.to,
                    { type: 'action', content: [] }
                );
                // Correct way is usually splitBlock then lift or setNode.
                // But insertContentAt is safer for state machine transition. 
                // Or strictly: if empty? 
                // Standard behavior: Enter at end -> New Action.
                // Enter in middle -> Split, both become Slugline? Or second becomes Action?
                // Usually, splitting a header splits into header.
                // "Smart Enter":
                const { selection } = this.editor.state;
                const { $from, empty } = selection;

                if (!empty) return false;

                // If at end of line
                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'action' });
                }

                return false; // Default split behavior
            },
        };
    },
});
