'use client';
import { useEffect, useState, useCallback } from 'react';
import { AnalyticsData } from '@/types';
import StatsGrid from '@/components/analytics/StatsGrid';
import TaskChart from '@/components/analytics/TaskChart';
import AgentPieChart from '@/components/analytics/AgentPieChart';
import GlowCard from '@/components/ui/GlowCard';
import { BarChart3, CheckCircle, Clock, Users, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/analytics');
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const statsItems = analytics ? [
    { label: 'Total Tasks', value: analytics.totalTasks, icon: BarChart3, color: '#3B82F6', change: '+12% from last hour' },
    { label: 'Posted Today', value: analytics.postedToday, icon: CheckCircle, color: '#10B981', change: 'Live updating' },
    { label: 'Avg Gen Time', value: `${analytics.avgGenTime}ms`, icon: Clock, color: '#F59E0B' },
    { label: 'Active Agents', value: `${analytics.activeAgents}/2`, icon: Users, color: '#8B5CF6' },
  ] : [
    { label: 'Total Tasks', value: 0, icon: BarChart3, color: '#3B82F6' },
    { label: 'Posted Today', value: 0, icon: CheckCircle, color: '#10B981' },
    { label: 'Avg Gen Time', value: '0ms', icon: Clock, color: '#F59E0B' },
    { label: 'Active Agents', value: '2/2', icon: Users, color: '#8B5CF6' },
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
        <TaskChart data={analytics?.taskTimeline || []} />
        <AgentPieChart data={analytics?.tasksByAgent || []} />
      </div>

      {/* Event Distribution */}
      <GlowCard className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="h-4 w-4 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Tasks by Event Type</h3>
        </div>
        <div className="h-64">
          {analytics && analytics.tasksByEvent.some((e) => e.count > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={analytics.tasksByEvent} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
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
      {analytics && analytics.topContent.length > 0 && (
        <GlowCard className="p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Top Performing Content</h3>
          <div className="space-y-2">
            {analytics.topContent.slice(0, 5).map((task, i) => (
              <div
                key={task.id}
                className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3"
              >
                <span className="text-sm font-bold text-muted w-6">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/80 font-mono truncate">{task.content}</p>
                  <p className="text-[10px] text-muted mt-0.5">{task.agent} • {task.trigger}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-1.5 w-12 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${task.confidence}%`,
                        backgroundColor: task.confidence > 80 ? '#10B981' : '#F59E0B',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-emerald-400">{task.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>
      )}
    </div>
  );
}
