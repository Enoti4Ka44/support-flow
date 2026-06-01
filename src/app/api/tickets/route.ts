import { NextResponse } from 'next/server';
import { dbData } from '@/lib/db';
import type { Ticket } from '@/types/ticket';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tickets = [...dbData].sort((a, b) => {
      const aDate = new Date(a.created_at).getTime();
      const bDate = new Date(b.created_at).getTime();
      return bDate - aDate;
    });
    return NextResponse.json(tickets);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, priority, category, ai_response } = body;

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description required' }, { status: 400 });
    }

    const nextId = dbData.length > 0 ? Math.max(...dbData.map(t => Number(t.id))) + 1 : 1;

    const newTicket: Ticket = {
      id: nextId,
      title,
      description,
      priority: priority || 'medium',
      category: category || 'other',
      ai_response: ai_response || 'Спасибо за обращение. Мы рассмотрим вашу заявку.',
      ai_method: 'gemini-genai',
      status: 'open',
      created_at: new Date().toISOString(),
    };

    dbData.push(newTicket);

    return NextResponse.json(newTicket, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
  }
}
