# 🚀 Data Forge Release Notes

## [v1.2.0] - 2026-03-06
### Safety, Intelligence & Compliance

#### 🛡️ Production Safety & Environment Management
- **Environment Color Coding**: Assign a color label (Red/Orange/Green/Purple) to each database connection. The color is displayed as a 4px bar under the header, as a side-bar accent in the Sidebar footer dot, and as color-coded connection cards on the dashboard.
- **Read-Only Mode**: New toggle in connection settings enforces `SELECT`-only policy for a connection. Destructive SQL (`UPDATE`, `DELETE`, `INSERT`, `DROP`, `ALTER`, `TRUNCATE`, `EXEC`, etc.) is blocked at the backend API with HTTP 403 — immune to SQL comment bypass attempts.
- **Safety Banner & Badge**: A persistent red banner beneath the header and a `Read-Only` badge in the toolbar appear whenever a read-only connection is active.
- **Connection Card Indicators**: History cards now display environment color borders and a 🛡️ Shield badge for read-only connections.

#### 💅 Advanced SQL Linter & Formatter
- **Real-Time SQL Linter**: 10 lint rules fire automatically as you type (debounced 600ms). Rules cover: `SELECT *` (L001), `UPDATE/DELETE` without `WHERE` (L002/L003, Error level), leading-wildcard `LIKE` (L004), non-sargable `WHERE` functions (L005), `!=` vs `<>` style (L007), missing aggregate aliases (L008), `ORDER BY` without `TOP/LIMIT` (L009), and `WITH (NOLOCK)` dirty-read risk for MSSQL (L010).
- **Collapsible Lint Panel**: Appears below the SQL editor, shows badge counts by severity (Error/Warning/Info). Click any issue to expand its fix suggestion. Click the code badge to jump to the exact line/column.
- **SQL Formatter**: `Cmd+Shift+F` keyboard shortcut + toolbar button. Uppercases all SQL keywords, normalizes indentation (4-space), and structures clauses on new lines.

#### 🕵️ Data Masking (Privacy & Compliance)
- **Auto-Detection**: 30+ regex patterns automatically identify sensitive column names: password, email, phone, SSN, national_id, credit_card, cvv, iban, salary, token, api_key, address, dob, otp, and more.
- **Smart Contextual Masks**: Email → `jo•••@domain.com`, Phone → `•••-•••-5678`, Credit Card → `•••• •••• •••• 1234`, others → `P••••••d`.
- **Masking ON by Default**: Table views start with sensitive data protected. A 🛡️ shield icon appears in masked column headers.
- **Per-Table Toggle**: "Masked (N)" button in the DataTable footer toggles masking for the entire result set. Toggling off clears all individual cell reveals too.
- **Click-to-Reveal**: Single click on any masked cell reveals just that cell — global masking remains in effect.

#### 🗑️ Bulk Row Deletion
- **Checkbox Selection**: Per-row checkboxes + "Select All" in the table header.
- **Drop Rows Button**: Appears when rows are selected; generates dialect-aware `DELETE` SQL with smart PK detection.
- **Type-Safe Deletion**: Handles ISO date strings, booleans, and NULLs correctly for MSSQL, PostgreSQL, MySQL, and MariaDB.

---

## [v1.1.1] - 2026-03-05
### High-Performance Styling & Documentation
- **Premium Theme System**: Fully integrated **Light Mode** and **Dark Mode** toggle.
- **Auto-Theme Detection**: Persistent theme selection via `localStorage` with flicker-free loading scripts.
- **Theme Parity**: Monaco SQL Editor now deep-links with the application theme (`vs-dark`/`light`).
- **Default Theme Change**: **Light Mode** is now the default theme for a cleaner initial experience.
- **Documentation Center**: Launched the built-in `/documents` portal with comprehensive guides for users and developers.
- **Version Tracking**: Unified versioning across the UI, Documentation, and Package metadata.

---

## [v1.1.0] - 2026-03-05
### Smart Updates & Dialect Parity
- **Cross-Dialect Update Logic**: Refined `UPDATE` query generation for MSSQL, MySQL, and PostgreSQL.
- **Affected Rows Precision**: Improved `rowsAffected` and `rowCount` detection logic across different database drivers.
- **Smart Targeting**: Inline editing now prioritizes `id`, `uuid`, or `pk` columns for safer `WHERE` clause generation.
- **Redundant Naming Fix**: Resolved the `"db.db.table"` naming conflict in MariaDB update statements.
- **MSSQL Crash Fix**: Resolved `"Cannot read properties of undefined (reading 'rowsAffected')"` for SQL Server.
- **Defensive Error Handling**: Non-destructive alerts when attempting updates on views or query results with non-identifiable tables.

---

## [v1.0.0] - 2026-03-05
### The Official Launch
- **Official Product Release**
- **The Designer Suite**: Introduced Table, View, Procedure, and Visual Query designers.
- **AI Forge**: AI-powered code completion, performance advisor, and SQL fixer.
- **Enterprise Utilities**: Schema comparison, Import Wizard, and Server Monitor.
- **Obsidian-Glass Aesthetic**: Premium dark theme (v1.0.0 default).
- **Native IPC Core**: Production-ready stability via Electron.

---
*Built with ❤️ for Database Engineers — THREE MAN DEV, Bangkok 2026*
