'use client';
import { useCallback, useEffect, useRef } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { EventType } from '@/types';

const ALL_EVENTS: EventType[] = [
  'wicket', 'six', 'strategic_timeout', 'milestone',
  'partnership_break', 'final_over', 'victory',
  'dropped_catch', 'economy_highlight',
];

export function useMatchEvents() {
  const { matchContext, isSimulating, simulationInterval, addFeedItem } = useMatchStore();
  const simRef = useRef<NodeJS.Timeout | null>(null);

  const triggerEvent = useCallback(async (eventType: EventType) => {
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: eventType, matchContext }),
      });

      if (!res.ok) throw new Error('Failed to trigger event');
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
  }, [matchContext, addFeedItem]);

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
