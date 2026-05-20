'use client';
import { cn } from '@/lib/utils/cn';

interface PulsingDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PulsingDot({ color = '#10B981', size = 'md', className }: PulsingDotProps) {
  const sizes = { sm: 'h-2 w-2', md: 'h-3 w-3', lg: 'h-4 w-4' };
  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn('animate-ping absolute inline-flex rounded-full opacity-75', sizes[size])}
        style={{ backgroundColor: color }}
      />
      <span
        className={cn('relative inline-flex rounded-full', sizes[size])}
        style={{ backgroundColor: color }}
      />
    </span>
  );
}
