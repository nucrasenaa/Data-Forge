# 🚀 Data Forge | Feature Roadmap & Progress

This document tracks the development progress of **Data Forge**. It serves as a checklist for designers and AI agents to understand the current state and what needs to be implemented.

## 🛠 Project Status Summary
- **Primary Dialect**: MSSQL (SQL Server)
- **Secondary Dialects**: PostgreSQL, MySQL, MariaDB
- **Current Core**: Next.js + Electron + Monaco Editor + Basic CRUD

---

## 1. 📊 Data Utility (Data handling & Migration)
*Goal: Make data movement and schema inspection effortless.*

- [x] **Data Export Engine**
    - [x] Export to CSV
    - [x] Export to JSON
    - [x] Export to Excel (XLSX)
    - [x] Export as SQL `INSERT`,`CREATE` Scripts
- [x] **Visual Query Builder**
    - [x] Drag-and-drop table fields
    - [x] Visual Join manager
- [x] **Schema DDL Generator**
    - [x] "View Create Script" for Tables
    - [x] "View Create Script" for Views/Procedures
- [x] **Import Wizard**
    - [x] Import from CSV/JSON to existing tables

## 2. ⌨️ SQL Editor Enhancement (Developer Productivity)
*Goal: Provide a VS-Code-like experience for database administration.*

- [x] **Local Query History**
    - [x] Persistent log of executed queries (last 100)
    - [x] Searchable history panel
- [x] **Query Bookmarks & Snippets**
    - [x] Save frequently used queries with custom names
    - [x] Category-based management
- [x] **Visual Execution Plan (Explain)**
    - [x] Integration with `SET STATISTICS PROFILE ON` (MSSQL)
    - [x] Visual hierarchical node tree for Query Plan
- [x] **Result Set Management**
    - [x] Support for multiple result sets (Tabbed Navigation)
    - [x] Auto-indexing of results (Result 1, 2, ...)

## 3. 💎 Premium Aesthetics & UX (User Experience)
*Goal: Make the app feel like a top-tier, enterprise-grade tool.*

- [x] **ER Diagram Viewer** (Next Focus)
    - [x] Auto-generate relationship graph from Foreign Keys
    - [x] Draggable/Interactive nodes
- [x] **Premium Design System**
    - [x] Obsidian-Glass aesthetic & Backdrop blur
    - [x] High-contrast Dark mode with Sapphire accents
    - [x] Professional typography & layout refinement
- [x] **Keyboard Shortcut System**
    - [x] `Cmd/Ctrl + Enter`: Run Query
    - [x] `Cmd/Ctrl + \`: Clear Results
    - [x] `Cmd/Ctrl + P`: Search Tables (Quick Open Focus)
    - [x] `Cmd/Ctrl + T`: New Query Tab
    - [x] `Cmd/Ctrl + W`: Close Current Tab
- [x] **Custom Themes & UI Customization**
    - [x] Integrated "Data Forge" Obsidian Theme
    - [x] Dynamic Glassmorphism effects
- [x] **Multi-Window Support**
    - [x] Ability to pop out a Query Tab into a new window

## 4. 🤖 AI Intelligence (Smart Assistance)
*Goal: Leverage LLMs to speed up database tasks.*

- [ ] **Database Copilot (Chat to SQL)**
    - [ ] AI input bar: "Show me all users from Bangkok who ordered in 2024"
    - [ ] Context-aware generation (AI knows your table schema)
- [ ] **SQL Fixer & Analyzer**
    - [ ] "Fix this Error" button on SQL Syntax errors
    - [ ] AI-driven index suggestions for slow queries

## 5. 🏗 Advanced Enterprise Features
*Goal: Tools for heavy-duty database management.*

- [x] **Schema Comparison**
    - [x] Compare Schema A vs Schema B
    - [x] Generate Diff / Migration Script
- [x] **Server Monitor & Log Viewer**
    - [x] Real-time CPU/Memory usage tracking
    - [x] Background Job / SQL Agent job monitor (via Active Requests & Logs)
    - [x] Live Error Log viewing (MSSQL)
- [x] **User & Permission Manager**
    - [x] Visual UI for managing DB Users, Roles, and Permissions
    - [x] Granular permission inspection (MSSQL & PostgreSQL)

## 🏗 6. Schema Management & Creation (Designers)
*Goal: Provide visual designers for creating and altering database objects.*

- [x] **Visual Table Designer**
    - [x] Column management (Name, Type, Nullability, Primary Key)
    - [x] Constraint manager (Foreign Keys, Uniques, Checks)
    - [x] Index designer
- [x] **View Designer**
    - [x] Query-based view creation with syntax validation
- [x] **Procedure & Function Designer**
    - [x] Parameter definitions UI
    - [x] Template-based boilerplate generation

---

## 📝 Notes for AI Agents
- The project uses **Tailwind CSS** and **Lucide Icons**.
- Backend logic for database connection is located in `electron/db.js` and `electron/ipc-handlers.js`.
- Always check the `package.json` for installed drivers before implementing new dialect-specific features.
