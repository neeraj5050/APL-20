'use client';
import { AGENT_CONFIGS } from '@/types';
import type { Task } from '@/types';
import GlowCard from '@/components/ui/GlowCard';
import TypingIndicator from '@/components/ui/TypingIndicator';
import { cn } from '@/lib/utils/cn';
import { Clock, MessageCircle, Camera, TrendingUp } from 'lucide-react';
import { relativeTime } from '@/lib/utils/formatters';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const agentConfig = AGENT_CONFIGS.find((a) => a.id === task.agentId);
  const isProcessing = task.status === 'PROCESSING';
  const isPosted = task.status === 'POSTED';

  const priorityColors = {
    LOW: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' },
    MEDIUM: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
    HIGH: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  };

  const prio = priorityColors[task.priority];

  return (
    <GlowCard
      glowing={isProcessing}
      glowColor={agentConfig?.colorHex}
      className={cn('p-4', isProcessing && 'border-blue-500/30')}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{agentConfig?.emoji}</span>
          <span className="text-xs font-semibold" style={{ color: agentConfig?.colorHex }}>
            {agentConfig?.name}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border', prio.bg, prio.text, prio.border)}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Trigger event badge */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-1 text-xs text-white/80">
          {task.trigger}
        </span>
      </div>

      {/* Content */}
      {isProcessing && (
        <div className="mb-3 rounded-lg bg-white/[0.02] p-3">
          <TypingIndicator color={agentConfig?.colorHex} />
        </div>
      )}

      {isPosted && task.content && (
        <div className="mb-3 rounded-lg bg-white/[0.04] border border-white/[0.04] p-3">
          <p className="text-xs leading-relaxed text-white/80 font-mono">{task.content}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-muted">
          <Clock className="h-3 w-3" />
          <span className="text-[10px]">{relativeTime(task.createdAt)}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform icon */}
          {task.platform === 'Twitter' ? (
            <MessageCircle className="h-3 w-3 text-blue-400" />
          ) : (
            <Camera className="h-3 w-3 text-pink-400" />
          )}

          {/* Confidence bar */}
          {isPosted && task.confidence > 0 && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              <div className="h-1.5 w-12 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${task.confidence}%`,
                    backgroundColor: task.confidence > 80 ? '#10B981' : task.confidence > 60 ? '#F59E0B' : '#EF4444',
                  }}
                />
              </div>
              <span className="text-[10px] text-emerald-400">{task.confidence}%</span>
            </div>
          )}
        </div>
      </div>
    </GlowCard>
  );
}
