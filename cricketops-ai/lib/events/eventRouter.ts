// ============================================================
// Event Router — Maps events to agents and creates tasks
// ============================================================
import { EventType, EVENT_AGENT_MAP, EVENT_LABELS, AGENT_CONFIGS, MatchContext, Task, Priority } from '@/types';
import { generateTaskId } from '@/lib/utils/formatters';

function getPriority(eventType: EventType): Priority {
  const highPriority: EventType[] = ['victory', 'milestone', 'final_over'];
  const mediumPriority: EventType[] = ['wicket', 'six', 'partnership_break'];
  if (highPriority.includes(eventType)) return 'HIGH';
  if (mediumPriority.includes(eventType)) return 'MEDIUM';
  return 'LOW';
}

function getPlatform(): 'Twitter' | 'Instagram' {
  return Math.random() > 0.3 ? 'Twitter' : 'Instagram';
}

export function routeEvent(
  eventType: EventType,
  matchContext: MatchContext
): Task[] {
  const mapping = EVENT_AGENT_MAP[eventType];
  if (!mapping) return [];

  const tasks: Task[] = [];
  const agents = [mapping.primary, mapping.secondary].filter(Boolean) as string[];

  agents.forEach((agentId, index) => {
    const agentConfig = AGENT_CONFIGS.find((a) => a.id === agentId);
    if (!agentConfig) return;

    const task: Task = {
      id: generateTaskId(),
      agent: agentConfig.name,
      agentId: agentConfig.id,
      trigger: EVENT_LABELS[eventType] || eventType,
      content: '',
      status: 'TODO',
      priority: index === 0 ? getPriority(eventType) : 'LOW',
      platform: getPlatform(),
      confidence: 0,
      createdAt: new Date().toISOString(),
      matchContext,
    };

    tasks.push(task);
  });

  return tasks;
}
