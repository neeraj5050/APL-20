'use client';
import { useMatchStore } from '@/store/matchStore';

export default function LiveMatchBanner() {
  const { matchContext, isLive } = useMatchStore();

  const tickerText = `${matchContext.team1} ${matchContext.score} (${matchContext.overs} ov) • ${isLive ? 'LIVE' : 'RECENT'} • ${matchContext.team1} vs ${matchContext.team2} • CricketOps AI — Powered by 😂 Meme Agent & 📊 Prediction Agent`;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600/20 via-violet-600/20 to-blue-600/20 border-b border-white/[0.06]">
      <div className="flex h-8 items-center">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-8">
          <span className="text-xs font-medium text-blue-300">🏏 {tickerText}</span>
          <span className="text-xs text-white/20">•</span>
          <span className="text-xs font-medium text-blue-300">🏏 {tickerText}</span>
        </div>
      </div>
    </div>
  );
}
