'use client';
import { useMatchStore } from '@/store/matchStore';
import { AGENT_CONFIGS, EventType } from '@/types';
import { formatTime } from '@/lib/utils/formatters';
import { Activity } from 'lucide-react';

export default function ActivityFeed() {
  const { feedItems, tasks } = useMatchStore();

  // Build feed from tasks + explicit feed items
  const allFeed = [
    ...feedItems,
    ...tasks.map((t) => ({
      id: t.id,
      timestamp: t.postedAt || t.processedAt || t.createdAt,
      agentId: t.agentId,
      agentName: t.agent,
      eventType: t.trigger.toLowerCase().replace(/[^a-z_]/g, '').replace(/\s+/g, '_') as EventType,
      content: t.status === 'POSTED' ? t.content : `Task ${t.status.toLowerCase()}: ${t.trigger}`,
      status: t.status,
      taskId: t.id,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  // Deduplicate by taskId
  const seen = new Set<string>();
  const uniqueFeed = allFeed.filter((item) => {
    if (seen.has(item.taskId)) return false;
    seen.add(item.taskId);
    return true;
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-card p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-blue-400" />
        <h3 className="text-sm font-semibold text-white">Activity Feed</h3>
        <span className="ml-auto text-[10px] text-muted">{uniqueFeed.length} entries</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-thin">
        {uniqueFeed.length === 0 && (
          <div className="text-center py-8">
            <p className="text-xs text-muted">No activity yet. Trigger an event!</p>
          </div>
        )}

        {uniqueFeed.map((item) => {
          const agent = AGENT_CONFIGS.find((a) => a.id === item.agentId);
          const statusColors: Record<string, string> = {
            TODO: '#6B7280',
            PROCESSING: '#F59E0B',
            POSTED: '#10B981',
          };
          return (
            <div
              key={item.id + item.status}
              className="flex gap-3 rounded-lg bg-white/[0.02] border border-white/[0.04] p-3 transition-all hover:bg-white/[0.04]"
            >
              <span className="text-base mt-0.5">{agent?.emoji || '🏏'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-mono text-muted">
                    {formatTime(item.timestamp)}
                  </span>
                  <span
                    className="text-[10px] font-semibold"
                    style={{ color: agent?.colorHex }}
                  >
                    {agent?.name || item.agentName}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium"
                    style={{
                      backgroundColor: `${statusColors[item.status]}20`,
                      color: statusColors[item.status],
                    }}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-white/60 truncate">{item.content}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
