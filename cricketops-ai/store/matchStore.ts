// ============================================================
// Zustand Global Match Store — Full Client-Side Backend Simulation
// Persistent state via localStorage middleware
// Enables serverless execution for Firebase/Vercel compatibility
// ============================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MatchContext, Task, FeedItem, AgentStats, AgentId, EventType, AGENT_CONFIGS, EVENT_AGENT_MAP, EVENT_LABELS } from '@/types';
import { generateTaskId } from '@/lib/utils/formatters';

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
  toggleAgent: (agentId: string, isActive: boolean) => void;

  // Simulation
  isSimulating: boolean;
  simulationInterval: number;
  setIsSimulating: (sim: boolean) => void;
  setSimulationInterval: (interval: number) => void;

  // Filters
  selectedAgentFilter: AgentId | 'all';
  setSelectedAgentFilter: (filter: AgentId | 'all') => void;

  // Client-Side Pipeline Execution
  triggerEventClient: (eventType: EventType) => Promise<void>;
  resetAllState: () => void;
}

// Mock Content Generation logic for client-side pipeline
function generateMockContent(agentId: string, eventType: EventType, matchContext: MatchContext): { content: string; confidence: number } {
  const { team1, team2, score, overs } = matchContext;
  const mockContent: Record<string, Record<string, string[]>> = {
    meme: {
      wicket: [
        `😂 ${team2} fans celebrating that wicket like they won the IPL already. Bro, it's ${score} in ${overs} overs. Calm down.`,
        `POV: You're a ${team1} fan watching another wicket fall at ${score}. Pain. 💀`,
        `${team1} losing wickets like me losing my phone — every 5 minutes 😭`,
      ],
      six: [
        `That six was so big it probably has its own PIN code 😂 ${team1} ${score}`,
        `Bowler after conceding that six: "I didn't sign up for this" 💀 #${team1}vs${team2}`,
        `SIX! Even the camera man lost that one 😂 ${team1} on fire at ${score}! 🔥`,
      ],
      dropped_catch: [
        `🤦 That dropped catch is going straight to the "Top 10 anime betrayals" compilation`,
        `Dropped catch alert! Butterfingers sponsored by ${team2} today 😂`,
        `Me explaining to my ${team2} friend why that catch was easy: 🤡💀 #IPL`,
      ],
      victory: [
        `${team1} won and ${team2} fans suddenly have "network issues" 😂💀 #IPL`,
        `RIP ${team2} fans' group chats right now 💀 ${team1} take it home! 😂`,
      ],
      final_over: [
        `Last over and my heart rate is higher than the required run rate 😂 ${score}`,
        `Final over drama! Even Netflix couldn't script this 🍿😂 #${team1}vs${team2}`,
      ],
      partnership_break: [
        `Partnership broken! ${team2} fans breathing again after suffering 😂`,
        `That partnership was longer than my attention span 💀 Finally broken! #IPL`,
      ],
      milestone: [
        `Another fifty and he's celebrating like he just cleared his JEE exam 😂 ${score}`,
        `Half century! The crowd goes wild, Twitter goes wilder 😂🔥 #${team1}`,
      ],
      strategic_timeout: [
        `Strategic timeout = Me pretending to think while already knowing I'll order biryani 😂`,
        `${team1} at ${score} during timeout. Coach drawing plays, players checking Instagram 💀`,
      ],
      economy_highlight: [
        `This bowler's economy is lower than my bank balance 😂 Respect! #${team1}vs${team2}`,
      ],
    },
    prediction: {
      wicket: [
        `📊 Win probability shift: ${team1} now at ${Math.floor(Math.random() * 30 + 35)}% after that wicket. ${score} in ${overs} overs — chase getting tighter.`,
        `📊 Historical data: teams losing wickets at this stage win only 28% of IPL matches. ${team1} ${score} (${overs})`,
      ],
      strategic_timeout: [
        `📊 At ${overs} ov (${score}), teams batting first average 172 in IPL 2026. ${team1} need to accelerate NOW.`,
        `📊 Timeout analysis: Current RR ${(parseInt(score.split('/')[0]) / parseFloat(overs) || 8).toFixed(1)} vs required. ${team1} projected: ${Math.floor(Math.random() * 25 + 160)}.`,
      ],
      partnership_break: [
        `📊 Partnership broken! ${team1} were scoring at 9.2 RPO during the stand. Expect a dip to 7.5 RPO now.`,
      ],
      final_over: [
        `📊 Teams defending this total in last over: 61% win rate in IPL 2026. Edge to bowlers. ${score}`,
      ],
      economy_highlight: [
        `📊 Economy of 5.2 in powerplay — 3rd best this IPL season. ${team1} ${score} (${overs})`,
      ],
      milestone: [
        `📊 MILESTONE: 47th fifty+ at this venue in IPL history. This batter averaging 42.3 in death overs.`,
      ],
      victory: [
        `📊 ${team1} win → #2 on points table, NRR +0.847. Playoff probability: 94%. ${score} final.`,
      ],
      six: [
        `📊 That six traveled ~98m. This batter's strike rate in death overs: 186.4. ${team1} ${score}`,
      ],
      dropped_catch: [
        `📊 Dropped catches cost teams an avg 32 extra runs in IPL. This could be decisive. ${score}`,
      ],
    },
  };

  const agentContent = mockContent[agentId] || mockContent.meme;
  const pool = agentContent[eventType] || agentContent[Object.keys(agentContent)[0]];
  const content = pool[Math.floor(Math.random() * pool.length)];
  const confidence = Math.floor(Math.random() * 30 + 65);
  return { content, confidence };
}

const DEFAULT_AGENTS = AGENT_CONFIGS.map((a) => ({
  agentId: a.id,
  agentName: a.name,
  tasksToday: 0,
  totalTasks: 0,
  avgGenTime: 0,
  successRate: 100,
  isActive: true,
}));

export const useMatchStore = create<MatchStore>()(
  persist(
    (set, get) => ({
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

      // Agents initialization (default Meme and Prediction agents)
      agentStats: DEFAULT_AGENTS,
      setAgentStats: (stats) => set({ agentStats: stats }),
      toggleAgent: (agentId, isActive) =>
        set((s) => ({
          agentStats: s.agentStats.map((agent) =>
            agent.agentId === agentId ? { ...agent, isActive } : agent
          ),
        })),

      // Simulation
      isSimulating: false,
      simulationInterval: 8000,
      setIsSimulating: (sim) => set({ isSimulating: sim }),
      setSimulationInterval: (interval) => set({ simulationInterval: interval }),

      // Filters
      selectedAgentFilter: 'all',
      setSelectedAgentFilter: (filter) => set({ selectedAgentFilter: filter }),

      // Reset
      resetAllState: () =>
        set({
          tasks: [],
          feedItems: [],
          agentStats: DEFAULT_AGENTS,
        }),

      // Trigger Match Event and run task generation pipeline fully on the client
      triggerEventClient: async (eventType: EventType) => {
        const context = get().matchContext;
        const mapping = EVENT_AGENT_MAP[eventType];
        if (!mapping) return;

        const agents = [mapping.primary, mapping.secondary].filter(Boolean) as AgentId[];
        const nowStr = new Date().toISOString();

        // Create Feed and Task records for each active agent matched to the event
        agents.forEach(async (agentId) => {
          const stats = get().agentStats.find((a) => a.agentId === agentId);
          // Skip if agent is disabled
          if (stats && !stats.isActive) return;

          const agentConfig = AGENT_CONFIGS.find((a) => a.id === agentId);
          if (!agentConfig) return;

          const taskId = generateTaskId();

          // 1. Create a TODO task
          const task: Task = {
            id: taskId,
            agent: agentConfig.name,
            agentId: agentConfig.id,
            trigger: EVENT_LABELS[eventType] || eventType,
            content: '',
            status: 'TODO',
            priority: agentId === mapping.primary ? 'HIGH' : 'LOW',
            platform: Math.random() > 0.3 ? 'Twitter' : 'Instagram',
            confidence: 0,
            createdAt: nowStr,
            matchContext: context,
          };

          get().addTask(task);

          // Add to Activity Feed
          get().addFeedItem({
            id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            timestamp: nowStr,
            agentId: agentConfig.id,
            agentName: agentConfig.name,
            eventType,
            content: `Task created: ${task.trigger}`,
            status: 'TODO',
            taskId,
          });

          // 2. Simulate pipeline progression: TODO -> PROCESSING
          await new Promise((r) => setTimeout(r, 800));
          get().updateTask(taskId, { status: 'PROCESSING', processedAt: new Date().toISOString() });

          // 3. Generate mock AI content and move to POSTED
          const startTime = Date.now();
          await new Promise((r) => setTimeout(r, 600 + Math.random() * 1200)); // generate thinking delay
          const { content, confidence } = generateMockContent(agentId, eventType, context);
          const genTime = Date.now() - startTime;

          get().updateTask(taskId, {
            status: 'POSTED',
            content,
            confidence,
            postedAt: new Date().toISOString(),
          });

          // 4. Update stats for the active agent
          set((s) => ({
            agentStats: s.agentStats.map((a) => {
              if (a.agentId === agentId) {
                const newTotal = a.totalTasks + 1;
                const newAvg = Math.round((a.avgGenTime * a.totalTasks + genTime) / newTotal);
                return {
                  ...a,
                  tasksToday: a.tasksToday + 1,
                  totalTasks: newTotal,
                  avgGenTime: newAvg,
                  lastTriggered: new Date().toISOString(),
                };
              }
              return a;
            }),
          }));
        });
      },
    }),
    {
      name: 'cricketops_match_store', // unique name for localStorage persistence
      partialize: (state) => ({
        matchContext: state.matchContext,
        isLive: state.isLive,
        tasks: state.tasks,
        feedItems: state.feedItems,
        agentStats: state.agentStats,
      }),
    }
  )
);
