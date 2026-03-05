# Data Forge — Release Notes

---

## v0.5.0 — "Enterprise" Release
**Released: March 5, 2026**

This release focuses on heavy-duty database management, introducing the **Server Health Monitor** and **Live Log Viewer** for real-time diagnostics and performance tuning.

---

### 🆕 New Features

#### 📈 Server Health Monitor (MSSQL)
A real-time dashboard for monitoring the health and performance of your SQL Server instance. Visualize critical metrics without needing complex DMV queries.

- **Real-time CPU Usage**: Track SQL Server CPU utilization vs. System CPU.
- **Memory Pressure**: Monitor Buffer Cache Hit Ratio and Page Life Expectancy.
- **Active Requests**: View currently executing queries, their status, wait types, and duration.
- **Wait Statistics**: Identify bottlenecks (CPU, I/O, Memory, Network) at a glance.

#### 📜 Live Log Viewer
Stream database engine logs directly into a searchable, filtered interface.

- **MSSQL Error Log**: Search and filter the SQL Server current Error Log.
- **Auto-Refresh**: Poll for the latest entries to monitor startup or critical failures in real-time.

#### 🛡️ Access Control Forge (User Manager)
A visual interface for managing database users, roles, and permissions.

- **Principal Inspection**: List all database users, roles, and Windows groups (MSSQL & PostgreSQL).
- **Granular Permissions**: Inspect effective permissions and object-level rights for any selected user.
- **Security Audit**: Identify superusers and members of built-in fixed server/database roles.

#### ⚖️ Schema Architect Diff
Structural analysis tool to identify divergences between two database schemas.

- **Identify Missing Objects**: Detect tables that exist in Source but are missing in Target (and vice versa).
- **Object-Level Diff**: Compare structure across multiple databases in a single instance.
- **Synchronization SQL**: Automatically generate `CREATE` and `ALTER` stubs to synchronize structural changes.

---

### 🛠 Bug Fixes & Improvements

- **Visual Query Builder — MSSQL Pagination Fix**: Fixed a critical "Invalid usage of the option NEXT" error when fetching columns for MSSQL tables. The system now correctly handles existing `ORDER BY` clauses to prevent double-sorting syntax errors.
- **Visual Query Builder — PostgreSQL PK Detection**: Improved column fetching for PostgreSQL to correctly identify and highlight Primary Keys.
- **PostgreSQL Pagination**: Standardized `LIMIT/OFFSET` logic for PostgreSQL across both Web and Electron backends.

---


## v0.4.0 — "Architect" Release
**Released: March 5, 2026**

This release is the largest feature drop in Data Forge's history, introducing a full visual database architecting suite, multi-window workflows, and deep quality improvements across all existing tools.

---

### 🆕 New Features

#### 🪟 Multi-Window Support
Detach any tab into its own standalone window — perfect for multi-monitor setups or keeping a long-running query visible while you work elsewhere. Each popout window inherits the full session context (connection, query state, and results) and provides a complete, functional workspace including a Monaco SQL editor, data grid, and ER Diagram renderer.

- Hover over any tab → click the **⊡ pop-out icon** to open it in a new window.
- Works in both the web browser and native Electron desktop app.
- Electron app opens a **native `BrowserWindow`** with correct preload isolation.

#### 📐 ER Architect (ER Diagram Viewer)
A brand-new interactive entity-relationship diagram engine. Visualize your entire database schema at a glance from your foreign key relationships.

- Auto-generates a **draggable canvas** of all tables and their relationships.
- **Primary Keys** are highlighted with a 🔑 icon.
- **Relationship lines** are rendered as smooth cubic Bézier curves.
- **Zoom** (mouse wheel or toolbar) and **Pan** (drag to move the canvas) fully supported.
- Displayed in a dedicated **ER Architect** tab from the sidebar.
- Supports **MSSQL, MySQL/MariaDB, and PostgreSQL**.
- Shows a polished **"No Schema Detected"** empty state with a re-scan button when no tables are found.

#### 🔧 Visual Query Builder — Live Schema Engine
The Query Builder has been completely overhauled. Columns are now fetched **live from the database** the moment you click a table, instead of relying on potentially stale or placeholder data.

- Click a table in the sidebar → the builder immediately queries `INFORMATION_SCHEMA` for that table's real columns.
- Shows a **loading spinner** while columns are being fetched per-table.
- Displays **column type badges** (e.g., `varchar`, `int`, `datetime`) and **🔑 Primary Key** indicators.
- **"Select All"** button to select every column in one click.
- Displays a **column count** and **selected count** at the footer of each table card.
- Fully supports URL-based connections (e.g., `mysql://user:pass@host/db`).

---

### 🛠 Bug Fixes & Improvements

- **ER Diagram / Query Builder — URL Connection Fix**: Fixed a critical bug where connecting via a URL connection string left `config.database` undefined, causing `INFORMATION_SCHEMA` queries to return no results. The system now falls back to `DATABASE()` to resolve the active schema dynamically at runtime.
- **ER Diagram — Case-Insensitive Property Mapping**: Table and column property names from the database driver are now normalized (case-insensitive) to handle differences across MSSQL, MySQL, and PostgreSQL drivers.
- **ER Diagram — Canvas Size**: Expanded the SVG canvas from 5,000×5,000px to 10,000×10,000px to support larger schemas without relationship lines getting clipped.
- **Query Builder — Request Format**: Fixed an incorrect API request format (`{ ...config, query }` → `{ config, query }`) that caused column fetches to fail silently and fall back to placeholder data.
- **Query Builder — MySQL Backtick Syntax**: Fixed a JavaScript template literal conflict where MySQL's backtick-quoted column aliases (`` `Column` ``) caused the query string to be truncated. Replaced with unquoted `INFORMATION_SCHEMA` column names.
- **Electron IPC — ERD Handler**: Corrected a duplicated SQL fragment in `ipc-handlers.js` introduced by a prior patch that caused a JavaScript syntax error.
- **Multi-Window — State Serialization**: Popout windows correctly inherit the parent tab's SQL query, result set, and execution plan state via `sessionStorage`.

---

### 📦 Infrastructure

- Added `window:open` IPC channel to Electron (`preload.js` + `ipc-handlers.js`) for native multi-window support.
- Added `/popout` Next.js route as a standalone workspace page.
- Added `src/lib/popout.ts` utility for serializing and restoring tab sessions across windows.
- Updated `PROJECT_ROADMAP.md`: Multi-Window Support marked complete.
- Updated `README.md` with full feature documentation.

---

## v0.3.0 — "Forge" Release
**Released: March 4, 2026**

### Features
- **Visual Execution Plan (Explain)** — Interactive hierarchical node tree for MSSQL (`STATISTICS PROFILE`), MySQL, and PostgreSQL (`EXPLAIN`).
- **Result Set Management** — Multi-result-set support with auto-indexed tabbed navigation (Result 1, 2, ...).
- **Premium Design System** — Obsidian-Glass aesthetic with backdrop blur, glassmorphism, and high-contrast sapphire accent colors.
- **Keyboard Shortcut System** — `Cmd/Ctrl+Enter`, `Cmd/Ctrl+T`, `Cmd/Ctrl+W`, `Cmd/Ctrl+P`, `Cmd/Ctrl+R`.
- **URL Connection Mode** — Connect using a standard database URL string.

### Bug Fixes
- Fixed `config.server` validation error for URL-based MySQL connections.
- Fixed multi-statement SQL execution returning an error on semicolon-separated queries for MySQL/MariaDB.

---

## v0.2.0 — "Data Utility" Release
**Released: February 2026**

### Features
- **Data Export Engine** — CSV, JSON, Excel (XLSX), and SQL `INSERT`/`CREATE` script export.
- **Visual Query Builder** — Table and column selection with generated SQL preview.
- **Schema DDL Generator** — `CREATE` script generation for Tables, Views, and Stored Procedures.
- **Import Wizard** — CSV and JSON import into existing tables.
- **Local Query History** — Persistent, searchable log of the last 100 executed queries.
- **Query Bookmarks & Snippets** — Save and organize frequently used queries by category.
- **Visual Table Designer** — Full column, constraint, and index management UI.

---

## v0.1.0 — Initial Release
**Released: February 2026**

- Multi-tab SQL workspace with Monaco Editor.
- Support for MSSQL, PostgreSQL, MySQL, and MariaDB.
- Connection history with optional password caching.
- Inline data editing with safe `WHERE`-clause generation.
- Procedural snippet generation (`EXEC` / `CALL`).
- Electron desktop packaging for macOS and Windows.
