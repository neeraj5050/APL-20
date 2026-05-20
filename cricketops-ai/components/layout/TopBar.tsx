'use client';
import { useMatchStore } from '@/store/matchStore';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import PulsingDot from '@/components/ui/PulsingDot';
import { Bell, Search, RefreshCw, Wifi, WifiOff, Database } from 'lucide-react';

export default function TopBar() {
  const { matchContext, isLive } = useMatchStore();
  // This is the ONLY place useLiveMatch is called — it updates the store
  const { source, cacheInfo, lastFetched, refreshMatches, matches } = useLiveMatch();
  const isLiveApi = source === 'live';

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.06] bg-topbar backdrop-blur-xl px-6">
      {/* Match Score */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{matchContext.team1}</span>
            <span className="text-xs text-muted">vs</span>
            <span className="text-sm font-bold text-white">{matchContext.team2}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-sm font-mono font-semibold text-blue-400">
            {matchContext.score}
          </span>
          <span className="text-xs text-muted">({matchContext.overs} ov)</span>
          {isLive && (
            <div className="flex items-center gap-1.5 ml-1">
              <PulsingDot color="#EF4444" size="sm" />
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">Live</span>
            </div>
          )}
          {!isLive && isLiveApi && (
            <span className="text-[10px] text-muted ml-1">Recent</span>
          )}
        </div>

        {/* API source + usage indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {isLiveApi ? (
              <Wifi className="h-3.5 w-3.5 text-emerald-400" />
            ) : source === 'loading' ? (
              <div className="h-3.5 w-3.5 rounded-full bg-white/10 animate-pulse" />
            ) : (
              <WifiOff className="h-3.5 w-3.5 text-amber-400" />
            )}
            <span className="text-[10px] text-muted">
              {isLiveApi ? 'CricketData.org' : source === 'loading' ? 'Loading...' : 'Demo'}
            </span>
          </div>

          {/* API Quota Badge */}
          {cacheInfo && (
            <div
              className="flex items-center gap-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] px-2 py-1 cursor-help"
              title={`Cache: ${cacheInfo.source}\nAPI calls today: ${cacheInfo.apiCallsToday}/${cacheInfo.dailyLimit}\nMatches loaded: ${matches.length}\nLast fetched: ${lastFetched}`}
            >
              <Database className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-mono text-muted">
                {cacheInfo.apiCallsToday}/{cacheInfo.dailyLimit}
              </span>
              {cacheInfo.apiCallsToday >= 80 && (
                <span className="text-[10px] text-amber-400">⚠️</span>
              )}
            </div>
          )}

          <button
            onClick={refreshMatches}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-white/[0.04] border border-white/[0.06] text-muted hover:text-white hover:bg-white/[0.08] transition-all active:scale-90"
            title="Refresh match data"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-muted hover:text-white hover:bg-white/[0.08] transition-all">
          <Search className="h-4 w-4" />
        </button>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] border border-white/[0.06] text-muted hover:text-white hover:bg-white/[0.08] transition-all">
          <Bell className="h-4 w-4" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            3
          </span>
        </button>
        <div className="h-8 w-px bg-white/[0.06]" />
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
          A
        </div>
      </div>
    </header>
  );
}
