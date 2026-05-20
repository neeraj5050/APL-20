// ============================================================
// API: /api/analytics — GET aggregated stats
// ============================================================
import { NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function GET() {
  try {
    const analytics = memoryStore.getAnalytics();
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
