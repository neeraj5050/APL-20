'use client';
import { useMatchStore } from '@/store/matchStore';

export function useAgentStats() {
  const { agentStats, toggleAgent } = useMatchStore();

  const fetchStats = async () => {
    // No-op client-side since Zustand holds stats state
  };

  return { agentStats, fetchStats, toggleAgent };
}
