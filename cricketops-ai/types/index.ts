// ============================================================
// CricketOps AI — Type Definitions
// ============================================================

export type TaskStatus = 'TODO' | 'PROCESSING' | 'POSTED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH';
export type AgentId = 'meme' | 'prediction';
export type Platform = 'Twitter' | 'Instagram';

export type EventType =
  | 'wicket'
  | 'six'
  | 'strategic_timeout'
  | 'milestone'
  | 'partnership_break'
  | 'final_over'
  | 'victory'
  | 'dropped_catch'
  | 'economy_highlight';

export interface MatchContext {
  team1: string;
  team2: string;
  score: string;
  overs: string;
}

export interface Task {
  _id?: string;
  id: string;
  agent: string;
  agentId: AgentId;
  trigger: string;
  content: string;
  status: TaskStatus;
  priority: Priority;
  platform: Platform;
  confidence: number;
  createdAt: string;
  processedAt?: string;
  postedAt?: string;
  matchContext: MatchContext;
}

export interface MatchEvent {
  _id?: string;
  type: EventType;
  label: string;
  triggeredAgent: string;
  timestamp: string;
  matchData: MatchContext;
}

export interface AgentStats {
  _id?: string;
  agentId: AgentId;
  agentName: string;
  tasksToday: number;
  totalTasks: number;
  avgGenTime: number;
  successRate: number;
  lastTriggered?: string;
  isActive: boolean;
}

export interface AgentConfig {
  id: AgentId;
  name: string;
  emoji: string;
  color: string;
  colorHex: string;
  description: string;
  personality: string;
  triggerEvents: EventType[];
  systemPrompt: string;
}

export interface FeedItem {
  id: string;
  timestamp: string;
  agentId: AgentId;
  agentName: string;
  eventType: EventType;
  content: string;
  status: TaskStatus;
  taskId: string;
}

export interface AnalyticsData {
  totalTasks: number;
  postedToday: number;
  avgGenTime: number;
  activeAgents: number;
  tasksByAgent: { name: string; value: number; color: string }[];
  tasksByEvent: { name: string; count: number }[];
  taskTimeline: { time: string; count: number }[];
  topContent: Task[];
}

// Live match data from CricketData API
export interface LiveMatch {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: { name: string; shortname: string; img: string }[];
  score: { r: number; w: number; o: number; inning: string }[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

export const EVENT_LABELS: Record<EventType, string> = {
  wicket: '🏏 Wicket Falls!',
  six: '💥 SIX!',
  strategic_timeout: '⏱️ Strategic Timeout',
  milestone: '🏅 Milestone!',
  partnership_break: '💔 Partnership Broken',
  final_over: '🔥 Final Over!',
  victory: '🏆 Victory!',
  dropped_catch: '🤦 Dropped Catch!',
  economy_highlight: '📊 Economy Rate Alert',
};

// Only 2 Agents: Meme Agent & Prediction Agent
export const AGENT_CONFIGS: AgentConfig[] = [
  {
    id: 'meme',
    name: 'Meme Agent',
    emoji: '😂',
    color: 'amber',
    colorHex: '#F59E0B',
    description: 'Viral cricket meme creator with dark humor and team-specific banter',
    personality: 'Sarcastic, witty, internet culture enthusiast. Lives for cricket Twitter drama. Creates viral moments from every match event.',
    triggerEvents: ['wicket', 'dropped_catch', 'six', 'partnership_break', 'victory', 'final_over'],
    systemPrompt: `You are a viral cricket meme creator for IPL social media. You write short, punchy, sarcastic posts (max 280 chars) with cricket Twitter energy. Use 1-2 emojis max. Fan of: dark humor, team-specific banter, internet culture.`,
  },
  {
    id: 'prediction',
    name: 'Prediction Agent',
    emoji: '📊',
    color: 'blue',
    colorHex: '#3B82F6',
    description: 'Data-driven analyst making bold live match predictions and insights',
    personality: 'Confident, analytical, data-obsessed. Speaks in probabilities and stats. Combines prediction with stat insights for maximum impact.',
    triggerEvents: ['strategic_timeout', 'partnership_break', 'final_over', 'economy_highlight', 'milestone', 'wicket'],
    systemPrompt: `You are a cricket analytics expert who makes bold, data-driven live match predictions and stat insights. Write in confident, analyst style. Max 280 chars. No fluff. Combine predictions with interesting stats.`,
  },
];

export const EVENT_AGENT_MAP: Record<EventType, { primary: AgentId; secondary?: AgentId }> = {
  wicket: { primary: 'meme', secondary: 'prediction' },
  six: { primary: 'meme' },
  strategic_timeout: { primary: 'prediction' },
  milestone: { primary: 'prediction', secondary: 'meme' },
  partnership_break: { primary: 'prediction', secondary: 'meme' },
  final_over: { primary: 'meme', secondary: 'prediction' },
  victory: { primary: 'meme', secondary: 'prediction' },
  dropped_catch: { primary: 'meme' },
  economy_highlight: { primary: 'prediction' },
};
