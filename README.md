# Data Forge v1.0.0

**Data Forge** is an enterprise-grade, high-performance database management studio and AI-powered SQL editor built with **Next.js** and **Electron**. It provides a unified, multi-tabbed workspace for managing **SQL Server (MSSQL)**, **PostgreSQL**, **MySQL**, and **MariaDB** with a premium "Obsidian-Glass" aesthetic.

Optimized for high-productivity database engineering, Data Forge combines traditional administration tools with modern AI capabilities.

![App Icon](public/icon.png)

---

## 🚀 Features

### 🤖 AI Forge (Intelligence)
- **Cross-Database Intellisense** — Intelligent code completion that works across ALL explored databases on your server simultaneously.
- **AI Performance Advisor** — Analyze execution plans and get actionable index recommendations using AI diagnostics.
- **"Explain with AI"** — Get human-readable breakdowns of complex SQL queries and execution plans.
*   **AI SQL Fixer** — Automatically detects syntax errors and suggests corrected queries.

### 🗂 Core Workspace
- **Multi-Tab Workspace** — Open multiple tables, views, and custom query editors. Switch tasks without losing context.
- **Multi-Window Support** — Pop out any tab into a standalone native window for multi-monitor workflows.
- **Multi-Dialect Support** — Native support for MSSQL, PostgreSQL, MySQL, and MariaDB.

### ⌨️ SQL Editor
- **Monaco-Powered Editor** — Syntax highlighting, schema-aware autocomplete, and multi-cursor editing (engine behind VS Code).
- **Visual Query Builder** — Drag-and-drop interface to build complex multi-table JOIN queries.
- **Local Query History** — Searchable log of executed queries with one-click replay.
- **Bookmarks & Snippets** — Save frequently used queries with category management.

### 📊 Schema & Developer Tools
- **The Designer Suite** — Visual builders for **Tables, Views, and Procedures/Functions**. Build complex objects without manual SQL.
- **ER Architect** — Interactive entity-relationship diagrams generated from live database foreign keys.
- **Import Wizard** — High-speed data import from CSV/JSON with dynamic column metadata fetching.
- **Data Export Engine** — Export to CSV, JSON, Excel (XLSX), and SQL INSERT scripts.
- **Schema Comparison** — Identify and diff schema changes between two databases.
- **Server Health Monitor** — Real-time performance monitoring (CPU, RAM, Sessions, and Active Locks).

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Next.js](https://nextjs.org/) (App Router, Static Export) |
| **Desktop Wrapper** | [Electron](https://www.electronjs.org/) |
| **SQL Editor** | [Monaco Editor](https://microsoft.github.io/monaco-editor/) |
| **Styling** | Vanilla CSS (Obsidian-Glass) & Lucide Icons |
| **Drivers** | `tedious` (MSSQL), `pg` (PostgreSQL), `mysql2` (MySQL) |
| **AI Integration** | OpenAI, Anthropic, Gemini, Z.ai & local Ollama support |

---

## 📦 Getting Started

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nucrasenaa/db-editor.git
   cd db-editor
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Development

Run the **web version**:
```bash
yarn dev
```

Run the **Electron version**:
```bash
yarn electron-dev
```

### Build & Packaging

The application uses `electron-builder` for cross-platform production builds.

| Command | Output |
|---|---|
| `yarn build-mac` | macOS `.dmg` + `.zip` |
| `yarn build-win` | Windows `.exe` installer + `.zip` |
| `yarn build-all` | Universal Build |

---

## 🔒 Security & Architecture

- **Native IPC Core** — Critical database and AI logic is executed in the Electron Main process, ensuring 100% reliability in packaged production builds.
- **Credential Safety** — Passwords and API keys are stored in encrypted `localStorage` or session-only memory.
- **Context Isolation** — Hardened security using `contextBridge` to prevent untrusted code from accessing Node.js APIs.

---

## 📄 Developers

**THREE MAN DEV** © 2026. ALL RIGHTS RESERVED.  
BANGKOK, THAILAND

## 📄 License

MIT License.
