# 🛠 Developer Guide

## Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS & Vanilla CSS (Theme System)
- **Database Drivers**:
  - `mssql` (SQL Server)
  - `mysql2` (MySQL/MariaDB)
  - `pg` (PostgreSQL)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## Project Structure
- `/src/app/page.tsx`: Main application entry point and state management.
- `/src/lib/db.ts`: Core database proxy abstraction. Handles dialect-specific connection logic.
- `/src/app/api/db/`: All database-related API endpoints (Query, Update, Metadata, etc.).
- `/src/components/`: Reusable UI components (DataTable, Sidebar, Designers).

## Theme System
The application uses a hybrid CSS variable system.
- Tokens are defined in `globals.css` using Tailwind's `@theme` or standard `:root`.
- Light mode is toggled by adding the `.light` class to `document.documentElement`.
- The `theme` state is managed in `page.tsx` and persisted via `localStorage` as `forge-theme`.

## Adding a New Dialect
To add support for a new database type (e.g., SQLite, Oracle):
1. Update `DbProxy` interface in `@/lib/db.ts`.
2. Implement the connection and query logic in `getDbProxy`.
3. Update metadata queries in `@/app/api/db/metadata/route.ts` to support the new dialect's schema.
4. Ensure `DataTable` and `Update` logic can handle the new dialect's quoting characters (e.g., `""`, `[]`, or ` `` `).
