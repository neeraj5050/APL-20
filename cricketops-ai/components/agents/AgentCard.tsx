'use client';
import { AGENT_CONFIGS, AgentId } from '@/types';
import type { AgentStats } from '@/types';
import GlowCard from '@/components/ui/GlowCard';
import PulsingDot from '@/components/ui/PulsingDot';
import { cn } from '@/lib/utils/cn';
import { Power, Zap, Clock, Target, TrendingUp, Sparkles, MessageSquare } from 'lucide-react';
import { useMatchStore } from '@/store/matchStore';

interface AgentCardProps {
  agentId: AgentId;
  stats?: AgentStats;
  onToggle?: (agentId: string, isActive: boolean) => void;
  onForceTrigger?: (agentId: AgentId) => void;
}

export default function AgentCard({ agentId, stats, onToggle, onForceTrigger }: AgentCardProps) {
  const config = AGENT_CONFIGS.find((a) => a.id === agentId)!;
  const isActive = stats?.isActive ?? true;
  const { tasks } = useMatchStore();

  // Get recent posts by this agent
  const recentPosts = tasks
    .filter((t) => t.agentId === agentId && t.status === 'POSTED' && t.content)
    .slice(0, 3);

  return (
    <GlowCard className={cn('overflow-hidden transition-all duration-300', !isActive && 'opacity-40 grayscale')}>
      {/* Gradient header bar */}
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${config.colorHex}, ${config.colorHex}80)` }}
      />

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div
              className="relative flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-lg"
              style={{
                backgroundColor: `${config.colorHex}15`,
                boxShadow: isActive ? `0 0 20px ${config.colorHex}20` : 'none',
              }}
            >
              {config.emoji}
              {isActive && (
                <div className="absolute -bottom-0.5 -right-0.5">
                  <PulsingDot color={config.colorHex} size="sm" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {config.name}
                {isActive && <Sparkles className="h-4 w-4" style={{ color: config.colorHex }} />}
              </h3>
              <p className="text-[11px] text-muted mt-0.5 max-w-[260px] leading-relaxed">
                {config.personality}
              </p>
            </div>
          </div>

          <button
            onClick={() => onToggle?.(agentId, !isActive)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200',
              isActive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:scale-110'
                : 'border-white/10 bg-white/[0.04] text-muted hover:bg-white/[0.08] hover:scale-110'
            )}
          >
            <Power className="h-4 w-4" />
          </button>
        </div>

        {/* Stats Row - Horizontal Layout */}
        <div className="flex gap-2 mb-5">
          {[
            { icon: Target, label: 'Today', value: stats?.tasksToday || 0, suffix: '' },
            { icon: TrendingUp, label: 'Total', value: stats?.totalTasks || 0, suffix: '' },
            { icon: Clock, label: 'Speed', value: stats?.avgGenTime || 0, suffix: 'ms' },
            { icon: Zap, label: 'Rate', value: stats?.successRate || 100, suffix: '%' },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex-1 rounded-xl bg-white/[0.03] border border-white/[0.05] p-3 text-center hover:bg-white/[0.05] transition-all"
            >
              <stat.icon className="h-3.5 w-3.5 text-muted mx-auto mb-1.5" />
              <div className="text-base font-bold text-white">
                {stat.value}<span className="text-[10px] text-muted font-normal">{stat.suffix}</span>
              </div>
              <p className="text-[9px] text-muted uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Trigger Events */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            <MessageSquare className="h-3 w-3 text-muted" />
            <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Listens to</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {config.triggerEvents.map((evt) => (
              <span
                key={evt}
                className="text-[10px] px-2.5 py-1 rounded-lg border font-medium transition-all hover:scale-105"
                style={{
                  color: config.colorHex,
                  borderColor: `${config.colorHex}25`,
                  backgroundColor: `${config.colorHex}08`,
                }}
              >
                {evt.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>

        {/* Recent Posts Preview */}
        {recentPosts.length > 0 && (
          <div className="mb-5">
            <span className="text-[10px] text-muted uppercase tracking-wider font-medium">Recent Posts</span>
            <div className="mt-2 space-y-1.5">
              {recentPosts.map((post) => (
                <div
                  key={post.id}
                  className="rounded-lg bg-white/[0.02] border border-white/[0.04] px-3 py-2"
                >
                  <p className="text-[11px] text-white/60 font-mono truncate">{post.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Force Trigger Button */}
        <button
          onClick={() => onForceTrigger?.(agentId)}
          disabled={!isActive}
          className={cn(
            'w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-3',
            'text-xs font-bold uppercase tracking-wider transition-all duration-200',
            'hover:scale-[1.02] active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100'
          )}
          style={{
            borderColor: `${config.colorHex}30`,
            background: `linear-gradient(135deg, ${config.colorHex}10, ${config.colorHex}05)`,
            color: config.colorHex,
          }}
        >
          <Zap className="h-4 w-4" />
          Force Trigger Agent
        </button>
      </div>
    </GlowCard>
  );
}
