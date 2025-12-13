import Dexie, { type EntityTable } from 'dexie';
import { JSONContent } from '@tiptap/react';

interface Script {
    id: number;
    title: string;
    author: string;
    content: JSONContent; // JSON content from Tiptap
    updatedAt: Date;
    createdAt: Date;
}

const db = new Dexie('ScreenplayDB') as Dexie & {
    scripts: EntityTable<
        Script,
        'id' // primary key "id" (for the typings only)
    >;
};

// Schema declaration:
db.version(1).stores({
    scripts: '++id, title, author, updatedAt, createdAt' // primary key "id" (for the runtime!)
});

export type { Script };
export { db };
