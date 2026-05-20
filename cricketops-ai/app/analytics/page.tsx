'use client';
import { useMatchStore } from '@/store/matchStore';
import StatsGrid from '@/components/analytics/StatsGrid';
import TaskChart from '@/components/analytics/TaskChart';
import AgentPieChart from '@/components/analytics/AgentPieChart';
import GlowCard from '@/components/ui/GlowCard';
import { BarChart3, CheckCircle, Clock, Users, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const { tasks, agentStats } = useMatchStore();

  // Calculate analytics metrics dynamically client-side from the tasks list
  const totalTasks = tasks.length;
  const postedToday = tasks.filter((t) => t.status === 'POSTED').length;

  const totalAvgTime = agentStats.length > 0
    ? Math.round(agentStats.reduce((acc, s) => acc + s.avgGenTime, 0) / agentStats.length)
    : 0;

  const activeAgentsCount = agentStats.filter((s) => s.isActive).length;

  const tasksByAgent = agentStats.map((s) => ({
    name: s.agentName,
    value: s.totalTasks,
    color: s.agentId === 'meme' ? '#F59E0B' : '#3B82F6',
  }));

  // Tasks by Event Type
  const eventCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    eventCounts[t.trigger] = (eventCounts[t.trigger] || 0) + 1;
  });
  const tasksByEvent = Object.entries(eventCounts).map(([name, count]) => ({
    name,
    count,
  }));

  // Task Timeline (grouped by time)
  const timelineCounts: Record<string, number> = {};
  tasks.forEach((t) => {
    try {
      const timeStr = new Date(t.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      timelineCounts[timeStr] = (timelineCounts[timeStr] || 0) + 1;
    } catch {}
  });
  const taskTimeline = Object.entries(timelineCounts)
    .map(([time, count]) => ({ time, count }))
    .slice(-12); // take last 12 points

  const topContent = tasks
    .filter((t) => t.status === 'POSTED')
    .sort((a, b) => (b.confidence || 0) - (a.confidence || 0))
    .slice(0, 5);

  const statsItems = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: BarChart3,
      color: '#3B82F6',
      change: 'Calculated live',
    },
    {
      label: 'Posted Today',
      value: postedToday,
      icon: CheckCircle,
      color: '#10B981',
      change: 'Directly verified',
    },
    {
      label: 'Avg Gen Time',
      value: `${totalAvgTime}ms`,
      icon: Clock,
      color: '#F59E0B',
    },
    {
      label: 'Active Agents',
      value: `${activeAgentsCount}/2`,
      icon: Users,
      color: '#8B5CF6',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-white">Performance Analytics</h2>
        <p className="text-xs text-muted mt-1">Real-time metrics and content performance insights</p>
      </div>

      {/* KPI Cards */}
      <StatsGrid stats={statsItems} />

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TaskChart data={taskTimeline} />
        <AgentPieChart data={tasksByAgent} />
      </div>

      {/* Event Distribution */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Tasks by Event Type</h3>
        </div>
        <div className="h-64">
          {tasksByEvent.some((e) => e.count > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={tasksByEvent} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2D40" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  angle={-30}
                  textAnchor="end"
                  height={60}
                />
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
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-xs text-muted">No data yet. Trigger events from the dashboard!</p>
            </div>
          )}
        </div>
      </GlowCard>

      {/* Top Content */}
      {topContent.length > 0 && (
        <GlowCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Top Performing Content</h3>
          </div>
          <div className="space-y-3">
            {topContent.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg border border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] transition-all"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                      {task.agent}
                    </span>
                    <span className="text-[10px] text-muted">{task.trigger}</span>
                  </div>
                  <p className="text-xs text-white max-w-xl">{task.content}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-muted">Confidence</span>
                  <p className="text-xs font-mono font-bold text-amber-400">{task.confidence}%</p>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
