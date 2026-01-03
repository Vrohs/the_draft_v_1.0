import Dexie, { type EntityTable } from 'dexie';
import { JSONContent } from '@tiptap/react';

interface Script {
    id: number;
    title: string;
    author: string;
    content: JSONContent;
    updatedAt: Date;
    createdAt: Date;
}

const db = new Dexie('ScreenplayDB') as Dexie & {
    scripts: EntityTable<
        Script,
        'id'
    >;
};

db.version(1).stores({
    scripts: '++id, title, author, updatedAt, createdAt'
});

export type { Script };
export { db };
