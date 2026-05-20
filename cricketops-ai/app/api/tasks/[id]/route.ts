// ============================================================
// API: /api/tasks/[id] — PATCH update task
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = memoryStore.updateTask(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
