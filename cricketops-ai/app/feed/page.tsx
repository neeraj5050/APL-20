'use client';
import { useState } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { AGENT_CONFIGS, AgentId } from '@/types';
import { formatTime, relativeTime } from '@/lib/utils/formatters';
import GlowCard from '@/components/ui/GlowCard';
import { Search, Download, Rss } from 'lucide-react';

export default function FeedPage() {
  const { tasks } = useMatchStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState<AgentId | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = tasks.filter((t) => {
    if (agentFilter !== 'all' && t.agentId !== agentFilter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return t.content.toLowerCase().includes(q) || t.agent.toLowerCase().includes(q) || t.trigger.toLowerCase().includes(q);
    }
    return true;
  });

  const handleExport = () => {
    const headers = ['ID', 'Agent', 'Event', 'Status', 'Content', 'Confidence', 'Created'];
    const rows = filtered.map((t) => [t.id, t.agent, t.trigger, t.status, `"${t.content.replace(/"/g, '""')}"`, t.confidence, t.createdAt]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricketops-feed-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Activity Feed</h2>
          <p className="text-xs text-muted mt-1">Complete audit trail of all AI agent operations</p>
        </div>
        <button onClick={handleExport} className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs font-medium text-white hover:bg-white/[0.08] transition-all">
          <Download className="h-3.5 w-3.5" />
          Export CSV
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <input type="text" placeholder="Search content, agents..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full rounded-lg border border-white/[0.06] bg-white/[0.04] pl-10 pr-4 py-2 text-sm text-white placeholder-muted focus:outline-none focus:border-blue-500/50" />
        </div>
        <select value={agentFilter} onChange={(e) => setAgentFilter(e.target.value as AgentId | 'all')} className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
          <option value="all" className="bg-[#1A2235]">All Agents</option>
          {AGENT_CONFIGS.map((a) => (<option key={a.id} value={a.id} className="bg-[#1A2235]">{a.emoji} {a.name}</option>))}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-sm text-white focus:outline-none appearance-none cursor-pointer">
          <option value="all" className="bg-[#1A2235]">All Statuses</option>
          <option value="TODO" className="bg-[#1A2235]">📋 TODO</option>
          <option value="PROCESSING" className="bg-[#1A2235]">⚡ Processing</option>
          <option value="POSTED" className="bg-[#1A2235]">✅ Posted</option>
        </select>
        <span className="text-xs text-muted">{filtered.length} results</span>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <GlowCard className="p-12 text-center">
            <Rss className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted">No activity matching your filters</p>
            <p className="text-xs text-muted/60 mt-1">Trigger events from the dashboard to see activity here</p>
          </GlowCard>
        )}
        {filtered.map((task) => {
          const agent = AGENT_CONFIGS.find((a) => a.id === task.agentId);
          const sc: Record<string, string> = { TODO: '#6B7280', PROCESSING: '#F59E0B', POSTED: '#10B981' };
          return (
            <GlowCard key={task.id} className="p-4 hover:bg-card-hover transition-all">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-xl" style={{ backgroundColor: `${agent?.colorHex}15` }}>{agent?.emoji}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold" style={{ color: agent?.colorHex }}>{agent?.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: `${sc[task.status]}20`, color: sc[task.status] }}>{task.status}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.04] text-muted border border-white/[0.06]">{task.platform}</span>
                    {task.confidence > 0 && <span className="text-[10px] text-emerald-400">{task.confidence}%</span>}
                  </div>
                  <p className="text-xs text-white/50 mb-2">{task.trigger}</p>
                  {task.content && <p className="text-sm text-white/80 font-mono leading-relaxed bg-white/[0.02] rounded-lg p-3 border border-white/[0.04]">{task.content}</p>}
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-[10px] font-mono text-muted">{formatTime(task.createdAt)}</p>
                  <p className="text-[10px] text-muted/60">{relativeTime(task.createdAt)}</p>
                </div>
              </div>
            </GlowCard>
          );
        })}
      </div>
    </div>
  );
}
