# Data Forge 
Data Forge is a modern, high-performance database explorer and SQL editor built with Next.js and Electron. It provides a seamless, multi-tabbed interface for managing multiple database dialects including **SQL Server (MSSQL)**, **PostgreSQL**, **MySQL**, and **MariaDB**.

Optimized for use environments, it allows for secure, persistent, and fast database management across desktop and web.

![App Icon](public/icon.png)

## 🚀 Features

- **Multi-Tab Workspace**: Open multiple tables, views, and custom query editors simultaneously. Switch between tasks without losing context.
- **Multi-Dialect Support**: Native support for MSSQL, PostgreSQL, MySQL, and MariaDB with dialect-aware SQL snippet generation.
- **Hybrid IPC Architecture**: Uses Electron's Inter-Process Communication (IPC) for direct database access in the desktop app, bypassing browser restrictions and CORS issues.
- **Intelligent SQL Editor**: Powered by Monaco Editor (the core of VS Code) with syntax highlighting and basic autocomplete for keywords and schema objects.
- **Procedural Snippets**: Automatically fetch procedure parameters and generate `EXEC` or `CALL` statements with placeholders.
- **Inline Editing**: Edit data directly within the results grid with automatic `WHERE` condition generation for safe updates.
- **Connection History**: Securely save connection configurations with opt-in password caching.
- **Premium Aesthetics**: Sophisticated dark-mode interface with glassmorphism effects and smooth micro-animations.

## 🛠 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Static Export)
- **Desktop Wrapper**: [Electron](https://www.electronjs.org/)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Styling**: Tailwind CSS & Lucide Icons
- **Database Drivers**: `tedious` (MSSQL), `pg` (Postgres), `mysql2` (MySQL/MariaDB)

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/nucrasenaa/db-editor.git
   cd db-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Run the web version:
```bash
npm run dev
```

Run the Electron desktop version:
```bash
npm run electron-dev
```

## 🏗 Build & Packaging

The application is configured for production builds on macOS and Windows using `electron-builder`.

- **Build for macOS**: `npm run build-mac` (outputs `.dmg` and `.zip`)
- **Build for Windows**: `npm run build-win` (outputs `.exe` and `.zip`)
- **Build All**: `npm run build-all`

All build artifacts will be located in the `dist/` directory.

## 🔒 Security

- **Direct IPC Link**: Desktop version communicates directly with the database via Node.js, avoiding external API proxies.
- **Credential Caching**: Passwords are saved in local storage only if "Securely Cache Credentials" is explicitly enabled.
- **Bangkok Quality**: Engineered with precision by Three Man Dev.

## 📄 Developers

**THREE MAN DEV** © 2026. ALL RIGHTS RESERVED.
BANGKOK, THAILAND

## 📄 License

This project is licensed under the MIT License.
