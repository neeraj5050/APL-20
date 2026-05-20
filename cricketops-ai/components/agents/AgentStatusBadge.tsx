'use client';
import { cn } from '@/lib/utils/cn';
import PulsingDot from '@/components/ui/PulsingDot';

interface AgentStatusBadgeProps {
  status: 'active' | 'idle' | 'processing';
  color?: string;
  className?: string;
}

export default function AgentStatusBadge({ status, color, className }: AgentStatusBadgeProps) {
  const statusConfig = {
    active: { label: 'Active', dotColor: color || '#10B981' },
    idle: { label: 'Idle', dotColor: '#6B7280' },
    processing: { label: 'Processing', dotColor: '#F59E0B' },
  };

  const cfg = statusConfig[status];

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <PulsingDot color={cfg.dotColor} size="sm" />
      <span className="text-[10px] font-medium" style={{ color: cfg.dotColor }}>
        {cfg.label}
      </span>
    </span>
  );
}
