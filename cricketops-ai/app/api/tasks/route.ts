// ============================================================
// API: /api/tasks — GET all tasks, POST create task
// ============================================================
import { NextRequest, NextResponse } from 'next/server';
import { memoryStore } from '@/lib/memoryStore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');
    const tasks = memoryStore.getTasks(since || undefined);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const task = memoryStore.createTask(body);
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
