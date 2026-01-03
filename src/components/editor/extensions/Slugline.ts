import { Node, mergeAttributes, InputRule } from "@tiptap/core";

export const Slugline = Node.create({
    name: "slugline",

    priority: 1000,

    group: "block",

    content: "text*",

    marks: "",

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

                if ($from.parentOffset === $from.parent.content.size) {
                    return this.editor.commands.insertContent({ type: 'action' });
                }

                return false;
            },
        };
    },

    addInputRules() {
        return [
            new InputRule({
                find: /^(?:INT|EXT|EST|INT\.\/EXT|I\/E)\.\s$/i,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                handler: ({ state, range }: { state: any, range: any }) => {
                    const { tr } = state
                    const start = range.from
                    const end = range.to

                    tr.setBlockType(start, end, this.type)

                    return tr
                }
            }),
        ]
    },
});
