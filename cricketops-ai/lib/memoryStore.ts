// ============================================================
// In-Memory Store — Fallback when MongoDB is not available
// Uses globalThis to survive Next.js hot-reloads in dev mode
// ============================================================
import { Task, MatchEvent, AgentStats, AGENT_CONFIGS } from '@/types';

interface InMemoryStore {
  tasks: Task[];
  events: MatchEvent[];
  agentStats: AgentStats[];
}

// Attach to globalThis so data persists across hot-reloads
const globalForStore = globalThis as typeof globalThis & {
  __cricketOpsStore?: InMemoryStore;
};

if (!globalForStore.__cricketOpsStore) {
  globalForStore.__cricketOpsStore = {
    tasks: [],
    events: [],
    agentStats: AGENT_CONFIGS.map((a) => ({
      agentId: a.id,
      agentName: a.name,
      tasksToday: 0,
      totalTasks: 0,
      avgGenTime: 0,
      successRate: 100,
      isActive: true,
    })),
  };
}

const store = globalForStore.__cricketOpsStore;

export const memoryStore = {
  // Tasks
  getTasks: (since?: string) => {
    if (since) {
      return store.tasks.filter((t) => new Date(t.createdAt) > new Date(since));
    }
    return [...store.tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getTask: (id: string) => store.tasks.find((t) => t.id === id),

  createTask: (task: Omit<Task, '_id'>) => {
    store.tasks.unshift(task as Task);
    return task;
  },

  updateTask: (id: string, updates: Partial<Task>) => {
    const idx = store.tasks.findIndex((t) => t.id === id);
    if (idx !== -1) {
      store.tasks[idx] = { ...store.tasks[idx], ...updates };
      return store.tasks[idx];
    }
    return null;
  },

  // Events
  getEvents: () => [...store.events].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),

  createEvent: (event: MatchEvent) => {
    store.events.unshift(event);
    return event;
  },

  // Agent Stats
  getAgentStats: () => [...store.agentStats],

  getAgentStat: (agentId: string) => store.agentStats.find((a) => a.agentId === agentId),

  updateAgentStats: (agentId: string, updates: Partial<AgentStats>) => {
    const idx = store.agentStats.findIndex((a) => a.agentId === agentId);
    if (idx !== -1) {
      store.agentStats[idx] = { ...store.agentStats[idx], ...updates };
      return store.agentStats[idx];
    }
    return null;
  },

  // Analytics
  getAnalytics: () => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const postedToday = store.tasks.filter(
      (t) => t.status === 'POSTED' && new Date(t.createdAt) >= todayStart
    ).length;

    const genTimes = store.tasks
      .filter((t) => t.processedAt && t.createdAt)
      .map((t) => new Date(t.processedAt!).getTime() - new Date(t.createdAt).getTime());

    const avgGenTime = genTimes.length > 0 ? genTimes.reduce((a, b) => a + b, 0) / genTimes.length : 0;

    const tasksByAgent = AGENT_CONFIGS.map((a) => ({
      name: a.name,
      value: store.tasks.filter((t) => t.agentId === a.id).length,
      color: a.colorHex,
    }));

    const eventTypes = ['wicket', 'six', 'strategic_timeout', 'milestone', 'partnership_break', 'final_over', 'victory', 'dropped_catch', 'economy_highlight'];
    const tasksByEvent = eventTypes.map((e) => ({
      name: e.replace('_', ' '),
      count: store.tasks.filter((t) => t.trigger.toLowerCase() === e).length,
    }));

    // Timeline: last 60 minutes in 5-min buckets
    const timeline = [];
    for (let i = 11; i >= 0; i--) {
      const bucketStart = new Date(now.getTime() - i * 5 * 60 * 1000);
      const bucketEnd = new Date(now.getTime() - (i - 1) * 5 * 60 * 1000);
      const count = store.tasks.filter(
        (t) => new Date(t.createdAt) >= bucketStart && new Date(t.createdAt) < bucketEnd
      ).length;
      timeline.push({
        time: bucketStart.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        count,
      });
    }

    return {
      totalTasks: store.tasks.length,
      postedToday,
      avgGenTime: Math.round(avgGenTime),
      activeAgents: store.agentStats.filter((a) => a.isActive).length,
      tasksByAgent,
      tasksByEvent,
      taskTimeline: timeline,
      topContent: store.tasks
        .filter((t) => t.status === 'POSTED')
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 10),
    };
  },
};
