import mongoose, { Schema, Model } from 'mongoose';

export interface IEvent {
  type: string;
  label: string;
  triggeredAgent: string;
  timestamp: Date;
  matchData: {
    team1: string;
    team2: string;
    score: string;
    overs: string;
  };
}

const EventSchema = new Schema<IEvent>({
  type: { type: String, required: true },
  label: { type: String, required: true },
  triggeredAgent: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  matchData: {
    team1: String,
    team2: String,
    score: String,
    overs: String,
  },
});

const Event: Model<IEvent> = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

export default Event;
