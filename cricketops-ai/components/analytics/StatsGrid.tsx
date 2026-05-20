'use client';
import GlowCard from '@/components/ui/GlowCard';
import { LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <GlowCard key={stat.label} className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              {stat.change && (
                <p className="text-[10px] text-emerald-400 mt-1">{stat.change}</p>
              )}
            </div>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${stat.color}15` }}
            >
              <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
            </div>
          </div>
        </GlowCard>
      ))}
    </div>
  );
}
