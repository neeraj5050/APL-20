'use client';
import { useEffect, useCallback, useRef } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { Task } from '@/types';

export function useKanban() {
  const { tasks, setTasks, updateTask } = useMatchStore();
  const lastFetchRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      const url = lastFetchRef.current
        ? `/api/tasks?since=${encodeURIComponent(lastFetchRef.current)}`
        : '/api/tasks';
      const res = await fetch(url).catch(() => null);
      if (!res || !res.ok) return;
      const data: Task[] = await res.json();
      
      if (lastFetchRef.current && data.length > 0) {
        // Merge new tasks
        setTasks((prevTasks: Task[]) => {
          const map = new Map(prevTasks.map((t) => [t.id, t]));
          data.forEach((t) => map.set(t.id, t));
          return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });
      } else if (!lastFetchRef.current) {
        setTasks(data);
      }
      lastFetchRef.current = new Date().toISOString();
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [setTasks]);

  // Initial fetch + polling
  useEffect(() => {
    fetchTasks();
    intervalRef.current = setInterval(fetchTasks, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchTasks]);

  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const processingTasks = tasks.filter((t) => t.status === 'PROCESSING');
  const postedTasks = tasks.filter((t) => t.status === 'POSTED');

  return {
    tasks,
    todoTasks,
    processingTasks,
    postedTasks,
    refreshTasks: fetchTasks,
  };
}
