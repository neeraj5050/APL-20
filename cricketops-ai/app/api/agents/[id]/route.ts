// ============================================================
// API: /api/agents/[id] — PATCH toggle agent
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = memoryStore.updateAgentStats(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json({ error: 'Failed to update agent' }, { status: 500 });
  }
}
