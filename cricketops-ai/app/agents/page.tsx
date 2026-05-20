'use client';
import { AGENT_CONFIGS, AgentId } from '@/types';
import AgentCard from '@/components/agents/AgentCard';
import AgentLeaderboard from '@/components/agents/AgentLeaderboard';
import { useAgentStats } from '@/hooks/useAgentStats';
import { useMatchEvents } from '@/hooks/useMatchEvents';
import GlowCard from '@/components/ui/GlowCard';
import { Bot, Sparkles } from 'lucide-react';

export default function AgentsPage() {
  const { agentStats, toggleAgent } = useAgentStats();
  const { triggerEvent } = useMatchEvents();

  const handleForceTrigger = (agentId: AgentId) => {
    const config = AGENT_CONFIGS.find((a) => a.id === agentId);
    if (config && config.triggerEvents.length > 0) {
      const randomEvent = config.triggerEvents[Math.floor(Math.random() * config.triggerEvents.length)];
      triggerEvent(randomEvent);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 border border-violet-500/20">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white">Agent Command Center</h2>
          </div>
          <p className="text-xs text-muted ml-12">Your two specialized AI agents powering cricket content generation</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-2">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-white font-medium">{AGENT_CONFIGS.length} Agents</span>
          <span className="text-[10px] text-muted">|</span>
          <span className="text-xs text-emerald-400">{agentStats.filter(s => s.isActive).length} Active</span>
        </div>
      </div>

      {/* Agent Cards - Side by side for 2 agents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {AGENT_CONFIGS.map((config) => {
          const stats = agentStats.find((s) => s.agentId === config.id);
          return (
            <AgentCard
              key={config.id}
              agentId={config.id}
              stats={stats}
              onToggle={toggleAgent}
              onForceTrigger={handleForceTrigger}
            />
          );
        })}
      </div>

      {/* How It Works Section */}
      <GlowCard className="p-6">
        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
          <span className="text-base">⚡</span> How the AI Pipeline Works
        </h3>
        <div className="flex items-center justify-between gap-2">
          {[
            { step: '1', label: 'Match Event', desc: 'Wicket, Six, etc.', color: '#EF4444' },
            { step: '→', label: '', desc: '', color: '' },
            { step: '2', label: 'Agent Routes', desc: 'Event → Agent mapping', color: '#F59E0B' },
            { step: '→', label: '', desc: '', color: '' },
            { step: '3', label: 'AI Generates', desc: 'Content created', color: '#3B82F6' },
            { step: '→', label: '', desc: '', color: '' },
            { step: '4', label: 'Posted!', desc: 'Ready for social', color: '#10B981' },
          ].map((item, i) => (
            item.label ? (
              <div key={i} className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center">
                <div className="flex h-7 w-7 mx-auto items-center justify-center rounded-full text-xs font-bold text-white mb-1.5" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                  {item.step}
                </div>
                <p className="text-xs font-medium text-white">{item.label}</p>
                <p className="text-[10px] text-muted mt-0.5">{item.desc}</p>
              </div>
            ) : (
              <span key={i} className="text-lg text-muted/30">→</span>
            )
          ))}
        </div>
      </GlowCard>

      {/* Leaderboard */}
      <AgentLeaderboard stats={agentStats} />
    </div>
  );
}
