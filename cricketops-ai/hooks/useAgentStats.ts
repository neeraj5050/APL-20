'use client';
import { useEffect, useCallback } from 'react';
import { useMatchStore } from '@/store/matchStore';

export function useAgentStats() {
  const { agentStats, setAgentStats } = useMatchStore();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      if (!res.ok) return;
      const data = await res.json();
      setAgentStats(data);
    } catch (err) {
      console.error('Failed to fetch agent stats:', err);
    }
  }, [setAgentStats]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const toggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle agent:', err);
    }
  };

  return { agentStats, fetchStats, toggleAgent };
}
