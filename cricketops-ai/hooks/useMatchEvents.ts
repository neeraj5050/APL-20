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
  const { isSimulating, simulationInterval, triggerEventClient } = useMatchStore();
  const simRef = useRef<NodeJS.Timeout | null>(null);

  const triggerEvent = useCallback(async (eventType: EventType) => {
    // Directly run client-side event trigger pipeline
    await triggerEventClient(eventType);
  }, [triggerEventClient]);

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
