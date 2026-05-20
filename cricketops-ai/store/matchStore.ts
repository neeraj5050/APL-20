// ============================================================
// Zustand Global Match Store
// ============================================================
import { create } from 'zustand';
import { MatchContext, Task, FeedItem, AgentStats, AgentId } from '@/types';

interface MatchStore {
  // Match state
  matchContext: MatchContext;
  isLive: boolean;
  setMatchContext: (ctx: Partial<MatchContext>) => void;
  setIsLive: (live: boolean) => void;

  // Tasks
  tasks: Task[];
  setTasks: (tasks: Task[] | ((prev: Task[]) => Task[])) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;

  // Feed
  feedItems: FeedItem[];
  addFeedItem: (item: FeedItem) => void;

  // Agents
  agentStats: AgentStats[];
  setAgentStats: (stats: AgentStats[]) => void;

  // Simulation
  isSimulating: boolean;
  simulationInterval: number;
  setIsSimulating: (sim: boolean) => void;
  setSimulationInterval: (interval: number) => void;

  // Filters
  selectedAgentFilter: AgentId | 'all';
  setSelectedAgentFilter: (filter: AgentId | 'all') => void;
}

export const useMatchStore = create<MatchStore>((set) => ({
  // Match state
  matchContext: {
    team1: '...',
    team2: '...',
    score: '—',
    overs: '—',
  },
  isLive: false,
  setMatchContext: (ctx) =>
    set((s) => ({ matchContext: { ...s.matchContext, ...ctx } })),
  setIsLive: (live) => set({ isLive: live }),

  // Tasks
  tasks: [],
  setTasks: (tasksOrFn) =>
    set((s) => ({
      tasks: typeof tasksOrFn === 'function' ? tasksOrFn(s.tasks) : tasksOrFn,
    })),
  addTask: (task) =>
    set((s) => ({ tasks: [task, ...s.tasks] })),
  updateTask: (id, updates) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  // Feed
  feedItems: [],
  addFeedItem: (item) =>
    set((s) => ({ feedItems: [item, ...s.feedItems].slice(0, 100) })),

  // Agents
  agentStats: [],
  setAgentStats: (stats) => set({ agentStats: stats }),

  // Simulation
  isSimulating: false,
  simulationInterval: 8000,
  setIsSimulating: (sim) => set({ isSimulating: sim }),
  setSimulationInterval: (interval) => set({ simulationInterval: interval }),

  // Filters
  selectedAgentFilter: 'all',
  setSelectedAgentFilter: (filter) => set({ selectedAgentFilter: filter }),
}));
