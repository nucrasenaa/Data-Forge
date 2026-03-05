import { NextRequest, NextResponse } from 'next/server';
import { getDbProxy } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const { dbType, ...config } = await req.json();
        const dialect = dbType || 'mssql';
        const dbProxy = await getDbProxy({ ...config, dbType: dialect });

        try {
            if (dialect === 'mssql') {
                // Fetch missing indexes from DMVs
                const missingIndexQuery = `
                    SELECT TOP 20
                        migs.avg_total_user_cost * (migs.avg_user_impact / 100.0) * (migs.user_seeks + migs.user_scans) AS [weighted_impact],
                        mid.[statement] AS [table_name],
                        mid.equality_columns,
                        mid.inequality_columns,
                        mid.included_columns,
                        migs.user_seeks,
                        migs.user_scans,
                        migs.avg_user_impact
                    FROM sys.dm_db_missing_index_groups AS mig
                    JOIN sys.dm_db_missing_index_group_stats AS migs ON migs.group_handle = mig.index_group_handle
                    JOIN sys.dm_db_missing_index_details AS mid ON mid.index_handle = mig.index_handle
                    WHERE DB_ID(DB_NAME()) = mid.database_id
                    ORDER BY weighted_impact DESC;
                `;

                // Fetch expensive queries (last 24 hours or so)
                const expensiveQueriesQuery = `
                    SELECT TOP 20
                        SUBSTRING(st.text, (qs.statement_start_offset/2) + 1,
                        ((CASE statement_end_offset
                            WHEN -1 THEN DATALENGTH(st.text)
                            ELSE qs.statement_end_offset END
                                - qs.statement_start_offset)/2) + 1) AS [query_text],
                        qs.execution_count,
                        qs.total_worker_time / 1000 AS [total_cpu_ms],
                        qs.total_elapsed_time / 1000 AS [total_duration_ms],
                        qs.total_logical_reads AS [total_reads],
                        qs.last_execution_time
                    FROM sys.dm_exec_query_stats AS qs
                    CROSS APPLY sys.dm_exec_sql_text(qs.sql_handle) AS st
                    ORDER BY qs.total_worker_time DESC;
                `;

                const [missingIndexes, expensiveQueries] = await dbProxy.query(`${missingIndexQuery}; ${expensiveQueriesQuery};`) as any[];

                return NextResponse.json({
                    success: true,
                    data: {
                        missingIndexes: missingIndexes || [],
                        expensiveQueries: expensiveQueries || []
                    }
                });
            } else if (dialect === 'postgres') {
                // PostgreSQL missing indexes (using pg_stat_user_tables and index usage)
                // This is a common heuristic for Postgres
                const missingIndexQuery = `
                    SELECT
                        relname AS table_name,
                        seq_scan - idx_scan AS scan_diff,
                        seq_scan,
                        idx_scan,
                        n_live_tup as estimate_rows
                    FROM pg_stat_user_tables
                    WHERE seq_scan > 0
                    ORDER BY seq_scan DESC
                    LIMIT 20;
                `;

                const expensiveQueriesQuery = `
                    SELECT 
                        query as query_text,
                        calls as execution_count,
                        total_exec_time as total_duration_ms,
                        rows as total_rows
                    FROM pg_stat_statements
                    ORDER BY total_exec_time DESC
                    LIMIT 20;
                `;

                const missingIndexes = await dbProxy.query(missingIndexQuery) as any[];
                let expensiveQueries = [];
                try {
                    expensiveQueries = await dbProxy.query(expensiveQueriesQuery) as any[];
                } catch (e) {
                    // pg_stat_statements might not be enabled
                    console.log('pg_stat_statements not enabled');
                }

                return NextResponse.json({
                    success: true,
                    data: {
                        missingIndexes: missingIndexes || [],
                        expensiveQueries: expensiveQueries || []
                    }
                });
            } else {
                return NextResponse.json({
                    success: false,
                    message: `Performance Advisor is not yet optimized for ${dialect}. Support coming soon.`
                });
            }
        } finally {
            await dbProxy.close();
        }
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch performance data' },
            { status: 500 }
        );
    }
}
