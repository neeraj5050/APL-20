'use client';
import { useEffect, useCallback, useState } from 'react';
import { useMatchStore } from '@/store/matchStore';
import { LiveMatch } from '@/types';

interface CacheData {
  matches: LiveMatch[];
  timestamp: number;
}

const CACHE_KEY = 'cricketops_api_cache';
const CALLS_COUNT_KEY = 'cricketops_api_calls_today';
const API_KEY = '398635e7-06f0-4bc1-bd97-f5cef26c3289';

export function useLiveMatch() {
  const { setMatchContext, setIsLive } = useMatchStore();
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [source, setSource] = useState<string>('loading');
  const [cacheInfo, setCacheInfo] = useState<any>(null);
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [lastFetched, setLastFetched] = useState<string>('');

  const fetchMatches = useCallback(async () => {
    try {
      const now = Date.now();
      const todayStr = new Date().toDateString();

      // Retrieve/initialize daily API calls count in localStorage
      let callsToday = 0;
      const storedCallsInfo = localStorage.getItem(CALLS_COUNT_KEY);
      if (storedCallsInfo) {
        const { date, count } = JSON.parse(storedCallsInfo);
        if (date === todayStr) {
          callsToday = count;
        }
      }

      // Check client-side localStorage cache (5-min TTL)
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { matches: cachedMatches, timestamp }: CacheData = JSON.parse(cached);
        const age = Math.floor((now - timestamp) / 1000);

        if (age < 300) { // Under 5 minutes old
          setMatches(cachedMatches);
          setSource('live');
          setLastFetched(new Date(timestamp).toLocaleTimeString());
          setCacheInfo({
            source: 'local_storage_cache',
            apiCallsToday: callsToday,
            dailyLimit: 100,
            age,
            maxAge: 300,
          });
          updateMatchState(cachedMatches);
          return;
        }
      }

      // Safeguard: Stop making calls if we approach the limit
      if (callsToday >= 90) {
        console.warn('API quota safety buffer reached (90/100). Yielding mock fallback.');
        setSource('demo');
        setCacheInfo({
          source: 'quota_safeguard_active',
          apiCallsToday: callsToday,
          dailyLimit: 100,
          message: 'Quota buffer reached. Displaying simulated matches.',
        });
        return;
      }

      // Make direct API call on the client
      const url = `https://api.cricapi.com/v1/currentMatches?apikey=${API_KEY}&offset=0`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('API fetch failed');
      const apiResult = await res.json();

      const fetchedMatches: LiveMatch[] = apiResult.data || [];

      // Increment calls count
      callsToday += 1;
      localStorage.setItem(CALLS_COUNT_KEY, JSON.stringify({ date: todayStr, count: callsToday }));

      // Save to cache
      const cachePayload: CacheData = {
        matches: fetchedMatches,
        timestamp: now,
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cachePayload));

      setMatches(fetchedMatches);
      setSource('live');
      setLastFetched(new Date(now).toLocaleTimeString());
      setCacheInfo({
        source: 'direct_api_fetch',
        apiCallsToday: callsToday,
        dailyLimit: 100,
        age: 0,
        maxAge: 300,
      });

      updateMatchState(fetchedMatches);
    } catch (err) {
      console.error('Failed to fetch live match on client, using cached state:', err);
      // Fallback to cache if request fails, even if expired
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { matches: cachedMatches, timestamp }: CacheData = JSON.parse(cached);
        setMatches(cachedMatches);
        setSource('live');
        setCacheInfo({
          source: 'cache_fallback_after_error',
          apiCallsToday: 0,
          dailyLimit: 100,
        });
        updateMatchState(cachedMatches);
      }
    }
  }, [setMatchContext, setIsLive, selectedMatch]);

  const updateMatchState = (fetchedMatches: LiveMatch[]) => {
    if (fetchedMatches.length > 0) {
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
  };

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
