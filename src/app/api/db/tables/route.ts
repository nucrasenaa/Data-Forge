import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const config = await req.json();
        const query = `
      SELECT TABLE_NAME, TABLE_SCHEMA 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_SCHEMA, TABLE_NAME
    `;
        const result = await executeQuery(config, query);
        return NextResponse.json({ success: true, tables: result.recordset });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Failed to fetch tables' },
            { status: 500 }
        );
    }
}
