'use client';
import { useEffect, useCallback } from 'react';
import { useMatchStore } from '@/store/matchStore';

export function useAgentStats() {
  const { agentStats, setAgentStats } = useMatchStore();

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/agents').catch(() => null);
      if (!res || !res.ok) return;
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
      const res = await fetch(`/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Fallback: update local Zustand state directly
        setAgentStats(
          agentStats.map((s) => (s.agentId === agentId ? { ...s, isActive } : s))
        );
        return;
      }
      fetchStats();
    } catch (err) {
      console.error('Failed to toggle agent:', err);
      // Fallback: update local Zustand state directly
      setAgentStats(
        agentStats.map((s) => (s.agentId === agentId ? { ...s, isActive } : s))
      );
    }
  };

  return { agentStats, fetchStats, toggleAgent };
}
