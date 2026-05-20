'use client';
import { cn } from '@/lib/utils/cn';
import { EventType } from '@/types';

const eventColors: Record<string, string> = {
  wicket: '#EF4444',
  six: '#F59E0B',
  strategic_timeout: '#3B82F6',
  milestone: '#10B981',
  partnership_break: '#EC4899',
  final_over: '#EF4444',
  victory: '#F59E0B',
  dropped_catch: '#8B5CF6',
  economy_highlight: '#06B6D4',
};

interface EventBadgeProps {
  type: EventType | string;
  className?: string;
}

export default function EventBadge({ type, className }: EventBadgeProps) {
  const color = eventColors[type] || '#6B7280';
  return (
    <span
      className={cn('inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium border', className)}
      style={{
        color,
        borderColor: `${color}30`,
        backgroundColor: `${color}10`,
      }}
    >
      {type.replace(/_/g, ' ')}
    </span>
  );
}
