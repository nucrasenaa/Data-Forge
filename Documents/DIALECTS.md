# 🗄 Dialect Support Details

Data Forge abstraction layers handle the nuances between different SQL engines.

## 🟢 Microsoft SQL Server (MSSQL)
- **Quoting**: Uses `[]` for identifiers.
- **Pagination**: Uses `OFFSET n ROWS FETCH NEXT m ROWS ONLY`. Requires an `ORDER BY` clause.
- **Top N**: Automatically strips `TOP` when applying custom pagination.
- **Affected Rows**: Handled via `result.rowsAffected` (Array of numbers).

## 🔵 MySQL & MariaDB
- **Quoting**: Uses ` `` ` for identifiers.
- **Pagination**: Uses `LIMIT offset, limit`.
- **Database Scope**: Tables are referenced as `database.table` to handle cross-database queries in the same connection.
- **Affected Rows**: Handled via `result.affectedRows`.

## 🐘 PostgreSQL
- **Quoting**: Uses `""` for identifiers.
- **Pagination**: Uses `LIMIT n OFFSET m`.
- **Schema Control**: Defaults to `public` schema unless specified. Filters out internal catalogs (`information_schema`, `pg_catalog`).
- **Affected Rows**: Handled via `result.rowCount`.

## 🧪 Consistency Mapping
We use `INFORMATION_SCHEMA` wherever possible to ensure maximum compatibility across different versions of these databases.
