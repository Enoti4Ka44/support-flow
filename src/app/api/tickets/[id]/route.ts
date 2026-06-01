import { NextResponse } from 'next/server';
import { dbData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // Next.js 15: params is a promise
) {
  try {
    const { id } = await params;
    const ticket = dbData.find(t => String(t.id) === id);
    
    if (!ticket) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    return NextResponse.json(ticket);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const initialIndex = dbData.findIndex(t => String(t.id) === id);
    
    if (initialIndex === -1) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    
    dbData.splice(initialIndex, 1);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete ticket' }, { status: 500 });
  }
}
