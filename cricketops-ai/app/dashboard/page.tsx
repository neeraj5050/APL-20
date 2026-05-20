'use client';
import KanbanBoard from '@/components/board/KanbanBoard';
import EventSimulator from '@/components/events/EventSimulator';
import ActivityFeed from '@/components/feed/ActivityFeed';

export default function DashboardPage() {
  return (
    <div className="flex gap-4 h-[calc(100vh-10rem)]">
      {/* Left: Event Simulator */}
      <div className="w-72 flex-shrink-0">
        <EventSimulator />
      </div>

      {/* Center: Kanban Board */}
      <div className="flex-1 min-w-0">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Live Operations Board</h2>
          <p className="text-xs text-muted mt-1">AI agents processing cricket events in real-time</p>
        </div>
        <KanbanBoard />
      </div>

      {/* Right: Activity Feed */}
      <div className="w-80 flex-shrink-0">
        <ActivityFeed />
      </div>
    </div>
  );
}
