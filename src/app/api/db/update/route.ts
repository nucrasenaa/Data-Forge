import { NextRequest, NextResponse } from 'next/server';
import { getDbProxy } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { config, table, database, updates, where } = await req.json();
        const dialect = config.dbType || 'mssql';

        if (!table || !updates || !where) {
            return NextResponse.json({ success: false, message: 'Missing required update parameters' }, { status: 400 });
        }

        const targetDb = database || config.database;
        const qStart = dialect === 'mssql' ? '[' : (dialect === 'postgres' ? '"' : '`');
        const qEnd = dialect === 'mssql' ? ']' : (dialect === 'postgres' ? '"' : '`');

        // Security: Sanitize identifiers (table names, column names) to prevent injection
        const sanitizeId = (name: string) => name.replace(/[^a-zA-Z0-9_.[\]`"]/g, '');
        const safeTable = sanitizeId(table);
        const safeDatabase = sanitizeId(targetDb);

        // Helper to format values for SQL based on dialect
        const formatVal = (val: any) => {
            if (val === null) return 'NULL';
            if (typeof val === 'number' || typeof val === 'boolean') return val;
            // Dates or strings
            const str = String(val);
            const escaped = str.replace(/'/g, "''"); // All dialects support '' for literals
            return `'${escaped}'`;
        };

        // Construct SET clause
        const setClause = Object.entries(updates)
            .map(([col, val]) => `${qStart}${sanitizeId(col)}${qEnd} = ${formatVal(val)}`)
            .join(', ');

        // Construct WHERE clause - prioritizing id/ID/uuid
        const whereEntries = Object.entries(where);
        const idCol = whereEntries.find(([col]) => ['id', 'ID', 'uuid', 'guid', 'pk', 'UID'].includes(col.toLowerCase()));

        let finalWhere = '';
        if (idCol) {
            // If we have an ID column, use just that as it's the safest way to target the row
            finalWhere = `${qStart}${sanitizeId(idCol[0])}${qEnd} = ${formatVal(idCol[1])}`;
        } else {
            // Fallback: use all non-complex columns
            finalWhere = whereEntries
                .filter(([_, val]) => typeof val !== 'object' || val === null) // skip blobs/objects
                .map(([col, val]) => {
                    const safeCol = sanitizeId(col);
                    if (val === null) return `${qStart}${safeCol}${qEnd} IS NULL`;
                    return `${qStart}${safeCol}${qEnd} = ${formatVal(val)}`;
                })
                .join(' AND ');
        }

        const whereClause = finalWhere;

        // Logic to prevent redundant naming (e.g., db.db.table)
        let sql = '';
        if (dialect === 'mssql') {
            // Ensure 3-part name for MSSQL: [database].[schema].[table]
            const tablePath = safeTable.split('.').length < 3 ? `[${safeDatabase}].${safeTable}` : safeTable;
            sql = `UPDATE ${tablePath} SET ${setClause} WHERE ${whereClause}`;
        } else if (dialect === 'postgres') {
            sql = `UPDATE "${safeTable}" SET ${setClause} WHERE ${whereClause}`;
        } else {
            // MySQL / MariaDB
            if (safeTable.includes('.') && !safeTable.startsWith('`')) {
                const parts = safeTable.split('.');
                const dbPart = parts[0];
                const tablePart = parts[1];
                sql = `UPDATE \`${dbPart}\`.\`${tablePart}\` SET ${setClause} WHERE ${whereClause}`;
            } else if (safeTable.includes('`.`')) {
                sql = `UPDATE ${safeTable} SET ${setClause} WHERE ${whereClause}`;
            } else {
                sql = `UPDATE \`${safeDatabase}\`.\`${safeTable}\` SET ${setClause} WHERE ${whereClause}`;
            }
        }

        console.log('--- DB UPDATE DEBUG ---');
        console.log('Dialect:', dialect);
        console.log('SQL:', sql);
        console.log('-----------------------');

        const dbProxy = await getDbProxy(config);

        try {
            const result = await dbProxy.query(sql);
            let rowsAffected = 0;

            if (result) {
                if (dialect === 'mssql') {
                    // Check multiple possible locations for rowsAffected in MSSQL
                    if (result.rowsAffected && Array.isArray(result.rowsAffected)) {
                        rowsAffected = result.rowsAffected[0];
                    } else if (typeof result.rowsAffected === 'number') {
                        rowsAffected = result.rowsAffected;
                    }
                } else if (dialect === 'postgres') {
                    rowsAffected = (result.rowCount !== undefined) ? result.rowCount : 1;
                } else {
                    // MySQL/MariaDB
                    rowsAffected = result.affectedRows || (result.data ? result.data.length : 0);
                }
            }

            return NextResponse.json({
                success: true,
                rowsAffected: rowsAffected
            });
        } finally {
            await dbProxy.close();
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Update failed' },
            { status: 500 }
        );
    }
}
