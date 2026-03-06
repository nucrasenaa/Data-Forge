# Data Forge v1.2.0

**Data Forge** is an enterprise-grade, high-performance database management studio and AI-powered SQL editor built with **Next.js** and **Electron**. It provides a unified, multi-tabbed workspace for managing **SQL Server (MSSQL)**, **PostgreSQL**, **MySQL**, and **MariaDB** with a premium aesthetic that adapts to your environment.

Optimized for high-productivity database engineering, Data Forge combines traditional administration tools with modern AI capabilities, production safety features, and compliance tooling.

<img src="public/icon.png" width="60" height="60" alt="App Icon" />

---

## 🚀 What's New in v1.2.0

### 🛡️ Production Safety & Environment Management
- **Environment Color Coding** — Assign distinct colors (Red/Orange/Green/Purple/Default) to each connection, displayed as color bars, sidebar indicators, and connection card borders.
- **Read-Only Mode** — Enforce `SELECT`-only guards per connection. Destructive queries (`UPDATE`, `DELETE`, `INSERT`, `DROP`, etc.) are blocked at the API level with a 403 response — bypass-proof even against SQL comment tricks.
- **Safety Banner** — A prominent red banner appears at the top of the workspace whenever a Read-Only connection is active.

### 💅 SQL Linter & Formatter (Code Quality)
- **Real-Time Linter** — Analyzes your SQL as you type (debounced 600ms) and surfaces 10 rule categories:
  - `SELECT *` without column list (L001)
  - `UPDATE` / `DELETE` without `WHERE` (L002, L003) — **Error** level
  - Non-sargable `LIKE '%value'` leading wildcards (L004)
  - Functions in `WHERE` clause preventing index use (L005)
  - Non-standard `!=` instead of `<>` (L007)
  - Missing aggregate aliases (L008)
  - `ORDER BY` without `TOP`/`LIMIT` (L009)
  - `WITH (NOLOCK)` dirty-read risks for MSSQL (L010)
- **SQL Formatter** — One-click format via toolbar button or `Cmd+Shift+F` shortcut. Uppercases keywords, normalizes indentation, and structures major clauses.
- **Collapsible Lint Panel** — Appears below the editor with error/warning/info counts. Click any issue to expand its fix suggestion. Click the badge to jump to the offending line.

### 🕵️ Data Masking (Privacy & Compliance)
- **Auto-Detection** — Sensitive columns are identified by name pattern automatically: emails, phones, passwords, SSN, credit cards, IBAN, salary, API keys, addresses, and more (30+ patterns).
- **Smart Masking** — Each column type gets a purpose-built mask: emails show `jo•••@domain`, phones show `•••-•••-5678`, cards show `•••• •••• •••• 1234`.
- **Masking is ON by Default** — Table view starts with data protected. A 🔒 badge appears in masked column headers.
- **Toggle per Table** — "Masked (N)" button in footer toggles all masking for the current result set.
- **Click-to-Reveal** — Click any individual masked cell to reveal just that value without disabling global masking.

### 🗑️ Bulk Row Deletion
- **Checkbox Selection** — Select individual rows or all rows via the header checkbox.
- **Drop Rows Button** — Deletes selected rows using dialect-aware `DELETE` statements with smart primary key detection.
- Works correctly across MSSQL, PostgreSQL, MySQL, and MariaDB with proper date/boolean type handling.

---

## 📋 Full Feature List

### 🗂 Core Workspace & Connectivity
- **Multi-Tab Workspace** — Query, Table, Designer, ER Diagram, Monitor, and Tool tabs in a single window.
- **Tab Persistence** — Open tabs and queries are saved and restored per connection.
- **Auto-Connect** — Securely cached credentials support one-click connection from the dashboard.
- **Connection String Mode** — Paste full URIs (`postgresql://`, `mysql://`, etc.) without filling each field manually.
- **Multi-Window / Pop-Out** — Pop any tab into an independent browser window.

### 📊 Data Utility
- **Data Export Engine** — Export results to CSV, JSON, Excel (XLSX), or `INSERT` SQL scripts (MSSQL / PostgreSQL dialect).
- **Import Wizard** — Bulk import CSV / JSON into existing tables with column mapping.
- **Schema DDL Generator** — Generate `CREATE` scripts for any Table, View, or Procedure.

### ⌨️ SQL Editor
- **Monaco Editor** — Full VS-Code-style editor with syntax highlighting, IntelliSense, bracket matching, and multi-cursor.
- **Cross-DB IntelliSense** — Auto-completes tables, views, procedures, and columns across all explored databases simultaneously.
- **Query History** — Persistent searchable log of the last 100 executed queries.
- **Query Bookmarks** — Save and recall frequently used snippets with custom names.
- **Execution Plan Viewer** — Visual hierarchical plan tree for `EXPLAIN` / `SET STATISTICS PROFILE`.
- **AI Copilot (Cmd+K)** — Schema-aware natural language to SQL generation overlay.
- **SQL Formatter (Cmd+Shift+F)** — Format any query with uppercase keywords and clean indentation.
- **Real-Time SQL Linter** — Continuous best-practice checks as you type.

### 🤖 AI Intelligence
- **Multi-Provider AI** — OpenAI, Anthropic, Gemini, Z.ai, and Ollama (Local LLM).
- **AI SQL Fixer** — Multi-step error analysis and correction.
- **Performance Advisor** — Analyze execution plans; get AI-powered index recommendations.
- **"Explain with AI"** — Human-readable breakdown of complex execution plans.
- **Safety First Mode** — Always preview SQL before auto-execution.

### 🏗 Schema Designers
- **Visual Table Designer** — Manage columns, types, nullability, PKs, FKs, indexes, and constraints visually.
- **View Designer** — Build views with a query editor and column alias manager.
- **Procedure & Function Designer** — Parameter definitions, templates, and body editor.
- **Visual Query Builder** — Drag-and-drop table fields and join manager.
- **ER Diagram** — Auto-generate interactive entity-relationship graphs from live foreign keys.

### 🏢 Enterprise Tools
- **Schema Comparison** — Diff two database schemas and generate migration scripts.
- **Server Health Monitor** — Real-time CPU / memory / active sessions tracking.
- **User & Permission Manager** — Visual UI for DB users, roles, and granular permissions.
- **Mock Data Generator** — Generate thousands of realistic dummy rows (emails, names, UUIDs, dates) with auto-detected column types.
- **Mini Dashboards** — Save Bar / Line / Pie charts from result sets into a persistent dashboard board.

### 🛡️ Safety & Compliance
- **Environment Color Coding** — Visual connection environment tagging (Production/Staging/Dev/Analytics).
- **Read-Only Mode** — Server-side enforcement of SELECT-only policy per connection.
- **Data Masking** — Automatic PII/sensitive data masking in result grids with click-to-reveal.
- **SQL Linter** — Real-time detection of dangerous or inefficient SQL patterns.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Static Export) |
| **Desktop Wrapper** | [Electron](https://www.electronjs.org/) |
| **SQL Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Styling** | Vanilla CSS (Theme-aware) & Tailwind CSS |
| **Drivers** | `tedious` (MSSQL), `pg` (PostgreSQL), `mysql2` (MySQL/MariaDB) |

---

## 📦 Getting Started

### Installation & Development

1. Clone and install:
   ```bash
   git clone https://github.com/nucrasenaa/db-editor.git
   cd db-editor
   yarn install
   ```

2. Run environment:
   ```bash
   yarn dev           # Web Version (http://localhost:3000)
   yarn electron-dev  # Electron Desktop Version
   ```

### Build & Packaging

| Command | Output |
|---|---|
| `yarn build-mac` | macOS `.dmg` + `.zip` |
| `yarn build-win` | Windows `.exe` installer + `.zip` |
| `yarn build-all` | Universal Build |

---

## 🔒 Security & Architecture

- **Native IPC Core** — Critical database and AI logic is executed in the Electron Main process via IPC handlers.
- **Credential Safety** — Passwords can be optionally cached with encryption support.
- **Context Isolation** — Hardened security using `contextBridge`.
- **Read-Only Enforcement** — Backend API blocks destructive queries when Read-Only mode is enabled.
- **Comment-Bypass Protection** — SQL comment stripping prevents clever workarounds to safety guards.

---

## 📄 Developers

**THREE MAN DEV** © 2026. ALL RIGHTS RESERVED.  
BANGKOK, THAILAND

## 📄 License

MIT License.
