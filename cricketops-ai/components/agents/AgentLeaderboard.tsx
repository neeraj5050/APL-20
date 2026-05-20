'use client';
import { AgentStats, AGENT_CONFIGS } from '@/types';
import { cn } from '@/lib/utils/cn';
import { Trophy } from 'lucide-react';

interface AgentLeaderboardProps {
  stats: AgentStats[];
}

export default function AgentLeaderboard({ stats }: AgentLeaderboardProps) {
  const sorted = [...stats].sort((a, b) => b.totalTasks - a.totalTasks);

  const medals = ['🥇', '🥈', '🥉', '4️⃣'];

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card p-5">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Agent Leaderboard</h3>
      </div>

      <div className="space-y-2">
        {sorted.map((agent, i) => {
          const config = AGENT_CONFIGS.find((a) => a.id === agent.agentId);
          return (
            <div
              key={agent.agentId}
              className={cn(
                'flex items-center gap-3 rounded-lg border border-white/[0.04] p-3 transition-all hover:bg-white/[0.03]',
                i === 0 && 'border-amber-500/20 bg-amber-500/[0.03]'
              )}
            >
              <span className="text-lg w-6 text-center">{medals[i] || ''}</span>
              <span className="text-lg">{config?.emoji}</span>
              <div className="flex-1">
                <span className="text-sm font-medium text-white">{config?.name}</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-muted">{agent.totalTasks} posts</span>
                  <span className="text-[10px] text-muted">{agent.avgGenTime}ms avg</span>
                  <span className="text-[10px] text-emerald-400">{agent.successRate}%</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-bold text-white">{agent.tasksToday}</span>
                <p className="text-[10px] text-muted">today</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
