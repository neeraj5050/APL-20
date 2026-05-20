// ============================================================
// API: /api/agents — GET all agent stats
// ============================================================
import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  try {
    const stats = memoryStore.getAgentStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}
