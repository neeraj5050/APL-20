'use client';
import { useMatchEvents } from '@/hooks/useMatchEvents';
import { EventType, EVENT_LABELS } from '@/types';
import { cn } from '@/lib/utils/cn';
import { Zap, Shuffle } from 'lucide-react';
import { useState } from 'react';

const eventStyles: Record<EventType, { color: string; bg: string }> = {
  wicket: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  six: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  strategic_timeout: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  milestone: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  partnership_break: { color: '#EC4899', bg: 'rgba(236,72,153,0.1)' },
  final_over: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
  victory: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  dropped_catch: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  economy_highlight: { color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
};

export default function EventSimulator() {
  const { triggerEvent, triggerRandomEvent, allEvents } = useMatchEvents();
  const [triggering, setTriggering] = useState<string | null>(null);

  const handleTrigger = async (eventType: EventType) => {
    setTriggering(eventType);
    await triggerEvent(eventType);
    setTimeout(() => setTriggering(null), 600);
  };

  const handleRandom = async () => {
    setTriggering('random');
    await triggerRandomEvent();
    setTimeout(() => setTriggering(null), 600);
  };

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="h-4 w-4 text-amber-400" />
        <h3 className="text-sm font-semibold text-white">Event Simulator</h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        {allEvents.map((event) => {
          const style = eventStyles[event];
          const isActive = triggering === event;
          return (
            <button
              key={event}
              onClick={() => handleTrigger(event)}
              disabled={!!triggering}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-[11px] font-medium transition-all duration-200',
                'hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50',
                isActive && 'scale-[0.98]'
              )}
              style={{
                borderColor: `${style.color}30`,
                backgroundColor: isActive ? style.bg : 'transparent',
                color: style.color,
              }}
            >
              <span className="text-xs">{EVENT_LABELS[event].split(' ')[0]}</span>
              <span className="truncate">{event.replace(/_/g, ' ')}</span>
            </button>
          );
        })}
      </div>

      <button
        onClick={handleRandom}
        disabled={!!triggering}
        className={cn(
          'w-full flex items-center justify-center gap-2 rounded-lg border border-violet-500/30',
          'bg-gradient-to-r from-violet-500/10 to-blue-500/10 px-4 py-2.5',
          'text-xs font-semibold text-violet-300 transition-all duration-200',
          'hover:from-violet-500/20 hover:to-blue-500/20 hover:scale-[1.01]',
          'active:scale-[0.99] disabled:opacity-50'
        )}
      >
        <Shuffle className="h-3.5 w-3.5" />
        Random Event
      </button>
    </div>
  );
}
