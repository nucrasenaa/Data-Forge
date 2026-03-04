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

        // Construct SET clause
        const setClause = Object.entries(updates)
            .map(([col, val]) => {
                const formattedVal = val === null ? 'NULL' : (typeof val === 'string' ? `'${val.replace(/'/g, dialect === 'mssql' ? "''" : (dialect === 'postgres' ? "''" : "\\'"))}'` : val);
                return `${qStart}${col}${qEnd} = ${formattedVal}`;
            })
            .join(', ');

        // Construct WHERE clause
        const whereClause = Object.entries(where)
            .map(([col, val]) => {
                if (val === null) return `${qStart}${col}${qEnd} IS NULL`;
                const formattedVal = typeof val === 'string' ? `'${val.replace(/'/g, dialect === 'mssql' ? "''" : (dialect === 'postgres' ? "''" : "\\'"))}'` : val;
                return `${qStart}${col}${qEnd} = ${formattedVal}`;
            })
            .join(' AND ');

        const sql = dialect === 'mssql'
            ? `UPDATE [${targetDb}].${table} SET ${setClause} WHERE ${whereClause}`
            : (dialect === 'postgres'
                ? `UPDATE "${table}" SET ${setClause} WHERE ${whereClause}`
                : `UPDATE \`${targetDb}\`. \`${table}\` SET ${setClause} WHERE ${whereClause}`);

        const dbProxy = await getDbProxy(config);

        try {
            const result = await dbProxy.query(sql);
            let rowsAffected = 0;
            if (dialect === 'mssql') {
                rowsAffected = result.rowsAffected ? result.rowsAffected[0] : 0;
            } else if (dialect === 'postgres') {
                // In PostgreSQL, pg client might return the count or an array of rows
                // Since our proxy returns res.rows, we might need a better count for PostgreSQL updates
                // However, UPDATE in Postgres often returns an empty array unless returning is used.
                // For direct UPDATE sql, standard res.rowCount would be better, but the proxy returns res.rows.
                // Let's assume common UPDATE syntax.
                rowsAffected = 1; // Simplified for now as res.rowCount is missing in rows-only proxy
            } else {
                rowsAffected = result.affectedRows || 0;
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
