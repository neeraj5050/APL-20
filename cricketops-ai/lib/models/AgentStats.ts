import mongoose, { Schema, Model } from 'mongoose';

export interface IAgentStats {
  agentId: string;
  agentName: string;
  tasksToday: number;
  totalTasks: number;
  avgGenTime: number;
  successRate: number;
  lastTriggered?: Date;
  isActive: boolean;
}

const AgentStatsSchema = new Schema<IAgentStats>({
  agentId: { type: String, required: true, unique: true },
  agentName: { type: String, required: true },
  tasksToday: { type: Number, default: 0 },
  totalTasks: { type: Number, default: 0 },
  avgGenTime: { type: Number, default: 0 },
  successRate: { type: Number, default: 100 },
  lastTriggered: { type: Date },
  isActive: { type: Boolean, default: true },
});

const AgentStats: Model<IAgentStats> =
  mongoose.models.AgentStats || mongoose.model<IAgentStats>('AgentStats', AgentStatsSchema);

export default AgentStats;
