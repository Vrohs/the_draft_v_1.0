The Draft A focused, writer-first screenwriting workspace for drafting, organizing, and sharing scripts.

What The Draft is The Draft is a cloud-first screenwriting tool built to help writers turn ideas into polished drafts quickly. It focuses on editing ergonomics, clear versioning, and lightweight collaboration — without the noise of bloated feature lists.

Key features

Natural auto-formatting: recognizes scene headings (INT./EXT.), character names, dialogue, parentheticals, and common transitions as you type.
Live collaboration: multiple writers can edit the same script with cursors, comments, and per-scene discussion threads.
Version history & named drafts: save snapshots, compare revisions, and restore earlier drafts.
Outline & index cards: build a scene-by-scene outline, drag to reorder, and jump straight to the scene in the editor.
Exports: generate PDF, Fountain, and Final Draft (.fdx) files for submissions or table reads.
Offline-friendly editor: continue writing when your connection drops — changes sync when you’re back online.
Why this README is different This copy focuses on concrete capabilities and day-to-day benefits for writers instead of vague, hypey claims. It’s written to be honest about what The Draft does and how it helps.

Quickstart (placeholder commands — replace with your actual scripts) Prerequisites

Node.js 18+ (or the version you use)
Yarn / npm / pnpm (choose one)
An account or API keys if a hosted backend is required
Clone and run locally

git clone https://github.com/Vrohs/the_draft_v_1.0.git
cd the_draft_v_1.0
cp .env.example .env # populate with your keys
npm install
npm run dev # or yarn dev / pnpm dev
Open http://localhost:3000
Build for production

npm run build
npm start
Contributing We welcome contributions. Please:

Open an issue first for non-trivial changes or feature proposals.
Follow the code style (ESLint, Prettier — add configs if needed).
Make changes on feature branches and open a pull request with a clear description and testing steps.
