'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { EventType, EVENT_LABELS, AGENT_CONFIGS, MatchContext, Task } from '@/types';

const ALL_EVENTS: EventType[] = [
  'wicket', 'six', 'strategic_timeout', 'milestone',
  'partnership_break', 'final_over', 'victory',
  'dropped_catch', 'economy_highlight',
];

// Helper client-side mock content generator
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

export function useMatchEvents() {
  const { matchContext, isSimulating, simulationInterval, addFeedItem, tasks, setTasks, agentStats, setAgentStats } = useMatchStore();
  const simRef = useRef<NodeJS.Timeout | null>(null);

  const runClientSidePipeline = useCallback((createdTasks: Task[], eventType: EventType) => {
    // For each task, transition statuses on the client side
    createdTasks.forEach((task) => {
      // Step 1: Transition to PROCESSING after 800ms
      setTimeout(() => {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: 'PROCESSING', processedAt: new Date().toISOString() }
              : t
          )
        );

        // Step 2: Transition to POSTED after another 1500ms
        setTimeout(() => {
          const { content, confidence } = generateMockContent(task.agentId, eventType, matchContext);
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id
                ? { ...t, status: 'POSTED', content, confidence, postedAt: new Date().toISOString() }
                : t
            )
          );

          // Update local agent stats
          setAgentStats(
            agentStats.map((s) => {
              if (s.agentId === task.agentId) {
                const newTotal = s.totalTasks + 1;
                return {
                  ...s,
                  tasksToday: s.tasksToday + 1,
                  totalTasks: newTotal,
                  lastTriggered: new Date().toISOString(),
                };
              }
              return s;
            })
          );
        }, 1500);
      }, 800);
    });
  }, [matchContext, setTasks, setAgentStats, agentStats]);

  const triggerEvent = useCallback(async (eventType: EventType) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType, matchContext }),
      }).catch(() => null);

      if (!res || !res.ok) {
        // Run completely local client-side backup simulation if API is not available
        console.warn('API unavailable. Falling back to local client-side event generation.');
        
        // 1. Manually route event
        const mapping = {
          wicket: { primary: 'meme', secondary: 'prediction' },
          six: { primary: 'meme' },
          strategic_timeout: { primary: 'prediction' },
          milestone: { primary: 'prediction', secondary: 'meme' },
          partnership_break: { primary: 'prediction', secondary: 'meme' },
          final_over: { primary: 'meme', secondary: 'prediction' },
          victory: { primary: 'meme', secondary: 'prediction' },
          dropped_catch: { primary: 'meme' },
          economy_highlight: { primary: 'prediction' },
        }[eventType];

        if (!mapping) return;

        const agents = [mapping.primary, mapping.secondary].filter(Boolean) as ('meme' | 'prediction')[];
        const newTasks: Task[] = agents.map((agentId, index) => {
          const config = AGENT_CONFIGS.find((a) => a.id === agentId);
          return {
            id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            agent: config?.name || agentId,
            agentId,
            trigger: EVENT_LABELS[eventType] || eventType,
            content: '',
            status: 'TODO',
            priority: index === 0 ? 'HIGH' : 'LOW',
            platform: Math.random() > 0.3 ? 'Twitter' : 'Instagram',
            confidence: 0,
            createdAt: new Date().toISOString(),
            matchContext,
          };
        });

        // Add to Zustand tasks
        setTasks((prev) => [...newTasks, ...prev]);

        // Add to feed
        newTasks.forEach((task) => {
          addFeedItem({
            id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            timestamp: new Date().toISOString(),
            agentId: task.agentId,
            agentName: task.agent,
            eventType,
            content: `Task created: ${task.trigger}`,
            status: 'TODO',
            taskId: task.id,
          });
        });

        // Run local status pipeline
        runClientSidePipeline(newTasks, eventType);
        return { event: { type: eventType, label: EVENT_LABELS[eventType] }, tasks: newTasks };
      }

      const data = await res.json();

      // Add to feed
      if (data.tasks) {
        data.tasks.forEach((task: any) => {
          addFeedItem({
            id: `feed_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
            timestamp: new Date().toISOString(),
            agentId: task.agentId,
            agentName: task.agent,
            eventType,
            content: `Task created: ${task.trigger}`,
            status: 'TODO',
            taskId: task.id,
          });
        });
      }

      return data;
    } catch (err) {
      console.error('Failed to trigger event:', err);
    }
  }, [matchContext, addFeedItem, setTasks, runClientSidePipeline]);

  const triggerRandomEvent = useCallback(() => {
    const randomEvent = ALL_EVENTS[Math.floor(Math.random() * ALL_EVENTS.length)];
    return triggerEvent(randomEvent);
  }, [triggerEvent]);

  // Auto-simulation
  useEffect(() => {
    if (isSimulating) {
      simRef.current = setInterval(() => {
        triggerRandomEvent();
      }, simulationInterval + Math.random() * 4000);
    } else {
      if (simRef.current) clearInterval(simRef.current);
    }
    return () => {
      if (simRef.current) clearInterval(simRef.current);
    };
  }, [isSimulating, simulationInterval, triggerRandomEvent]);

  return {
    triggerEvent,
    triggerRandomEvent,
    allEvents: ALL_EVENTS,
  };
}
