'use client';
import { useKanban } from '@/hooks/useKanban';
import KanbanColumn from './KanbanColumn';

export default function KanbanBoard() {
  const { todoTasks, processingTasks, postedTasks } = useKanban();

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      <KanbanColumn
        title="TODO"
        tasks={todoTasks}
        status="TODO"
        color="#6B7280"
        icon="📋"
      />
      <KanbanColumn
        title="PROCESSING"
        tasks={processingTasks}
        status="PROCESSING"
        color="#F59E0B"
        icon="⚡"
      />
      <KanbanColumn
        title="POSTED"
        tasks={postedTasks}
        status="POSTED"
        color="#10B981"
        icon="✅"
      />
    </div>
  );
}
