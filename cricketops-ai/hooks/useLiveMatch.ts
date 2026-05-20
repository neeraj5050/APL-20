'use client';
import { useEffect, useCallback, useState } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { LiveMatch } from '@/types';

interface CacheInfo {
  source: string;
  apiCallsToday: number;
  dailyLimit: number;
  age?: number;
  maxAge?: number;
  message?: string;
}

export function useLiveMatch() {
  const { setMatchContext, setIsLive } = useMatchStore();
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [source, setSource] = useState<string>('loading');
  const [cacheInfo, setCacheInfo] = useState<CacheInfo | null>(null);
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [lastFetched, setLastFetched] = useState<string>('');

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/cricket');
      if (!res.ok) return;
      const data = await res.json();

      const fetchedMatches: LiveMatch[] = data.matches || [];
      setMatches(fetchedMatches);
      setSource(data.source || 'mock');
      setCacheInfo(data.cacheInfo || null);
      setLastFetched(new Date().toLocaleTimeString());

      if (fetchedMatches.length > 0) {
        // Priority: find a live match first, otherwise use most recent
        let match: LiveMatch | undefined;

        // 1. Try to find an active live match
        const liveMatch = fetchedMatches.find(m => m.matchStarted && !m.matchEnded);
        if (liveMatch) {
          match = liveMatch;
          setIsLive(true);
        } else {
          // 2. Use selected match or first match (most recent result)
          match = fetchedMatches[selectedMatch] || fetchedMatches[0];
          setIsLive(false);
        }

        if (match) {
          // Extract team short names
          const team1Short = match.teamInfo?.[0]?.shortname
            || match.teams?.[0]?.split(' ').slice(-1)[0]
            || 'TM1';
          const team2Short = match.teamInfo?.[1]?.shortname
            || match.teams?.[1]?.split(' ').slice(-1)[0]
            || 'TM2';

          // Get latest score info
          const latestScore = match.score?.[match.score.length - 1];
          const scoreStr = latestScore ? `${latestScore.r}/${latestScore.w}` : '—';
          const oversStr = latestScore ? `${latestScore.o}` : '0';

          setMatchContext({
            team1: team1Short,
            team2: team2Short,
            score: scoreStr,
            overs: oversStr,
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch live match:', err);
    }
  }, [setMatchContext, setIsLive, selectedMatch]);

  useEffect(() => {
    fetchMatches();
    // Poll every 5 minutes to save API quota
    const interval = setInterval(fetchMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const selectMatch = (index: number) => {
    setSelectedMatch(index);
  };

  return {
    matches,
    source,
    cacheInfo,
    lastFetched,
    selectMatch,
    refreshMatches: fetchMatches,
  };
}
