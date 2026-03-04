import { NextRequest, NextResponse } from 'next/server';
import { getDbProxy } from '@/lib/db';

export async function POST(req: NextRequest) {
    try {
        const config = await req.json();
        const dbProxy = await getDbProxy(config);
        await dbProxy.close();
        return NextResponse.json({ success: true, message: 'Connection successful!' });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, message: error.message || 'Connection failed' },
            { status: 500 }
        );
    }
}
