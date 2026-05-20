'use client';
import { useMatchStore } from '@/store/matchStore';

export function useKanban() {
  const { tasks } = useMatchStore();

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const processingTasks = tasks.filter((t) => t.status === 'PROCESSING');
  const postedTasks = tasks.filter((t) => t.status === 'POSTED');

  const fetchTasks = async () => {
    // No-op client-side since Zustand holds the source of truth
  };

  return {
    tasks,
    todoTasks,
    processingTasks,
    postedTasks,
    refreshTasks: fetchTasks,
  };
}
