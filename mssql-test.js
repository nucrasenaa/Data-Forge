const { Client } = require('pg');
// ... just writing this to remember how MSSQL dates are often returned by tedious.
// Tedious returns dates as Date objects, which NextJS JSON.stringifies to ISO strings, meaning 2024-03-06T12:00:00.000Z.
// If the field is just Date, it returns 2024-03-06T00:00:00.000Z.
// Let's modify the comparison logic to just drop precision from dates to be safe, or cast properly for mssql.
