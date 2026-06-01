import { NextResponse } from 'next/server';
import { dbData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15: params is a promise
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;
    
    if (!status) {
      return NextResponse.json({ error: 'Status required' }, { status: 400 });
    }

    const ticketIndex = dbData.findIndex(t => String(t.id) === id);
    if (ticketIndex === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    dbData[ticketIndex].status = status;
    dbData[ticketIndex].closed_at = status === 'closed' ? new Date().toISOString() : undefined;
    
    return NextResponse.json(dbData[ticketIndex]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update ticket status' }, { status: 500 });
  }
}
