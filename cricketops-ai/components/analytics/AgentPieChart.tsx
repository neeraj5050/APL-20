'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import GlowCard from '@/components/ui/GlowCard';

interface AgentPieChartProps {
  data: { name: string; value: number; color: string }[];
}

export default function AgentPieChart({ data }: AgentPieChartProps) {
  const filteredData = data.filter((d) => d.value > 0);

  return (
    <GlowCard className="p-5">
      <h3 className="text-sm font-semibold text-white mb-4">Content by Agent</h3>
      <div className="h-64">
        {filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted">No data yet. Trigger some events!</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {filteredData.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1A2235',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#F9FAFB',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', color: '#9CA3AF' }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlowCard>
  );
}
