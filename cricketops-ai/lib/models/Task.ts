import mongoose, { Schema, Model } from 'mongoose';

export interface ITask {
  id: string;
  agent: string;
  agentId: string;
  trigger: string;
  content: string;
  status: 'TODO' | 'PROCESSING' | 'POSTED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  platform: string;
  confidence: number;
  createdAt: Date;
  processedAt?: Date;
  postedAt?: Date;
  matchContext: {
    team1: string;
    team2: string;
    score: string;
    overs: string;
  };
}

const TaskSchema = new Schema<ITask>(
  {
    id: { type: String, required: true, unique: true },
    agent: { type: String, required: true },
    agentId: { type: String, required: true, index: true },
    trigger: { type: String, required: true },
    content: { type: String, default: '' },
    status: { type: String, enum: ['TODO', 'PROCESSING', 'POSTED'], default: 'TODO', index: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    platform: { type: String, default: 'Twitter' },
    confidence: { type: Number, default: 0, min: 0, max: 100 },
    createdAt: { type: Date, default: Date.now, index: true },
    processedAt: { type: Date },
    postedAt: { type: Date },
    matchContext: {
      team1: { type: String, default: '' },
      team2: { type: String, default: '' },
      score: { type: String, default: '' },
      overs: { type: String, default: '' },
    },
  },
  { timestamps: false }
);

const Task: Model<ITask> = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default Task;
