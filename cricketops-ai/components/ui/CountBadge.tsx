'use client';
import { cn } from '@/lib/utils/cn';

interface CountBadgeProps {
  count: number;
  color?: string;
  className?: string;
}

export default function CountBadge({ count, color, className }: CountBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        className
      )}
      style={{
        backgroundColor: color ? `${color}20` : 'rgba(255,255,255,0.1)',
        color: color || '#9CA3AF',
      }}
    >
      {count}
    </span>
  );
}
