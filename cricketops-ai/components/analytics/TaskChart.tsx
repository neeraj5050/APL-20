'use client';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import GlowCard from '@/components/ui/GlowCard';

interface TaskChartProps {
  data: { time: string; count: number }[];
}

export default function TaskChart({ data }: TaskChartProps) {
  return (
    <GlowCard className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Tasks Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <defs>
              <linearGradient id="taskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1F2D40" />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#6B7280' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1A2235',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#F9FAFB',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#taskGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlowCard>
  );
}
