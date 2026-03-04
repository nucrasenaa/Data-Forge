import { NextRequest, NextResponse } from 'next/server';
import { getDbProxy } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { config, query, page = 1, pageSize = 100, orderBy, orderDir = 'ASC', includeCount = false } = await req.json();
        const dialect = config.dbType || 'mssql';

        if (!query) {
            return NextResponse.json({ success: false, message: 'Query is required' }, { status: 400 });
        }

        const trimmedQuery = query.trim();
        const isSelect = trimmedQuery.toUpperCase().startsWith('SELECT');

        let finalQuery = trimmedQuery;
        let totalRows = 0;

        const dbProxy = await getDbProxy(config);

        try {
            // Apply pagination logic for SELECT queries
            if (isSelect && !trimmedQuery.toUpperCase().includes('OFFSET') && !trimmedQuery.toUpperCase().includes('LIMIT') && !trimmedQuery.toUpperCase().includes('GROUP BY')) {
                const offset = (page - 1) * pageSize;

                // Clean up base query
                let baseQuery = trimmedQuery.replace(/;$/, '');
                if (dialect === 'mssql') {
                    baseQuery = baseQuery.replace(/SELECT\s+TOP\s+\d+/i, 'SELECT');
                } else {
                    baseQuery = baseQuery.replace(/LIMIT\s+\d+/i, '');
                    baseQuery = baseQuery.replace(/LIMIT\s+\d+,\s*\d+/i, '');
                }

                // Get total count if requested or on first load
                if (includeCount) {
                    const fromMatch = baseQuery.match(/FROM/i);
                    if (fromMatch && fromMatch.index !== undefined) {
                        const fromPart = baseQuery.substring(fromMatch.index);
                        const countSql = `SELECT COUNT(*) as total ${fromPart}`;
                        try {
                            const countResult = await dbProxy.query(countSql);
                            // PostgreSQL count result is nested in an array of objects
                            totalRows = (Array.isArray(countResult) ? parseInt(countResult[0]?.total || 0) : parseInt(countResult.total || 0)) || 0;
                        } catch (e) {
                            console.error('Count query failed', e);
                        }
                    }
                }

                if (dialect === 'mssql') {
                    const sortClause = orderBy ? `ORDER BY ${orderBy} ${orderDir}` : 'ORDER BY (SELECT NULL)';
                    finalQuery = `${baseQuery} ${sortClause} OFFSET ${offset} ROWS FETCH NEXT ${pageSize} ROWS ONLY`;
                } else {
                    const sortClause = orderBy ? `ORDER BY ${orderBy} ${orderDir}` : '';
                    finalQuery = `${baseQuery} ${sortClause} LIMIT ${pageSize} OFFSET ${offset}`;
                }
            }

            const data = await dbProxy.query(finalQuery);
            const rows = Array.isArray(data) ? data : [data].filter(Boolean);

            return NextResponse.json({
                success: true,
                data: rows,
                totalRows: totalRows || rows.length,
                columns: rows.length > 0 ? Object.keys(rows[0]) : [],
                page,
                pageSize
            });
        } finally {
            await dbProxy.close();
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Query execution failed' },
            { status: 500 }
        );
    }
}
