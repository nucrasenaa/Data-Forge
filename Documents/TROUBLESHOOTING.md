# 🆘 Troubleshooting Guide

## Connectivity Issues
- **Error: ETIMEDOUT**: Ensure the database server is reachable. If using a VPN or Tailscale, check if the connection is active.
- **SSL/TLS Errors**: MSSQL often requires `trustServerCertificate: true`. MySQL may need `rejectUnauthorized: false` for self-signed certificates.
- **Port Blocked**: Verify that your firewall allows traffic on the DB port (1433, 3306, 5432).

## UI & Performance
- **Theme Not Loading**: Try clearing your browser cache or deleting the `forge-theme` key from Local Storage.
- **Slow Queries**: Use the **Explain** feature in the SQL Editor to analyze query execution plans.
- **Table Not Found error**: Ensure the correct database is selected in the connection or specified in the query. For MariaDB, use `db.table` syntax if the table exists in a different database.

## Update Problems
- **0 rows affected**: This usually happens if the row has been modified or deleted. Ensure you have a Primary Key defined, as inline editing relies on `id`, `uuid`, or `pk` columns for accuracy.
- **Syntax Error on Update**: Check the terminal logs for the "DB UPDATE DEBUG" output to see the exact SQL being sent.
