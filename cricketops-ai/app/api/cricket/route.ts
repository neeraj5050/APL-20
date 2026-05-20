// ============================================================
// API: /api/cricket — GET live match data from CricketData.org
// Smart caching to stay within free tier (100 calls/day)
// ============================================================
import { NextResponse } from 'next/server';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

// ── Config ──────────────────────────────────────────────────
// Free tier = 100 calls/day → 1 call every ~15 minutes is safe
const CACHE_DURATION = 5 * 60 * 1000;   // 5 minutes in-memory cache
const DISK_CACHE_FILE = join(process.cwd(), '.cricket-cache.json');

// ── In-memory cache ─────────────────────────────────────────
interface CacheEntry {
  data: Record<string, unknown>;
  timestamp: number;
  apiCallsMade: number;
  lastResetDate: string;
}

let memoryCache: CacheEntry | null = null;

// Load disk cache on startup (survives server restarts)
function loadDiskCache(): CacheEntry | null {
  try {
    if (existsSync(DISK_CACHE_FILE)) {
      const raw = readFileSync(DISK_CACHE_FILE, 'utf-8');
      const cached = JSON.parse(raw) as CacheEntry;
      // Reset counter if it's a new day
      const today = new Date().toISOString().slice(0, 10);
      if (cached.lastResetDate !== today) {
        cached.apiCallsMade = 0;
        cached.lastResetDate = today;
      }
      return cached;
    }
  } catch {
    // Ignore disk cache errors
  }
  return null;
}

function saveDiskCache(entry: CacheEntry) {
  try {
    writeFileSync(DISK_CACHE_FILE, JSON.stringify(entry), 'utf-8');
  } catch {
    // Ignore write errors
  }
}

// ── Mock data ───────────────────────────────────────────────
const MOCK_MATCHES = [
  {
    id: 'mock_1',
    name: 'Mumbai Indians vs Chennai Super Kings, 45th Match',
    matchType: 't20',
    status: 'Mumbai Indians opt to bat',
    venue: 'Wankhede Stadium, Mumbai',
    date: new Date().toISOString().slice(0, 10),
    dateTimeGMT: new Date().toISOString(),
    teams: ['Mumbai Indians', 'Chennai Super Kings'],
    teamInfo: [
      { name: 'Mumbai Indians', shortname: 'MI', img: '' },
      { name: 'Chennai Super Kings', shortname: 'CSK', img: '' },
    ],
    score: [
      { r: 168, w: 4, o: 17.2, inning: 'Mumbai Indians Inning 1' },
    ],
    series_id: 'ipl_2026',
    fantasyEnabled: true, bbbEnabled: false, hasSquad: true,
    matchStarted: true, matchEnded: false,
  },
  {
    id: 'mock_2',
    name: 'Royal Challengers Bengaluru vs Kolkata Knight Riders, 46th Match',
    matchType: 't20',
    status: 'KKR need 42 runs in 24 balls',
    venue: 'M. Chinnaswamy Stadium, Bengaluru',
    date: new Date().toISOString().slice(0, 10),
    dateTimeGMT: new Date().toISOString(),
    teams: ['Royal Challengers Bengaluru', 'Kolkata Knight Riders'],
    teamInfo: [
      { name: 'Royal Challengers Bengaluru', shortname: 'RCB', img: '' },
      { name: 'Kolkata Knight Riders', shortname: 'KKR', img: '' },
    ],
    score: [
      { r: 195, w: 5, o: 20, inning: 'RCB Inning 1' },
      { r: 154, w: 3, o: 16, inning: 'KKR Inning 1' },
    ],
    series_id: 'ipl_2026',
    fantasyEnabled: true, bbbEnabled: false, hasSquad: true,
    matchStarted: true, matchEnded: false,
  },
];

// ── Main handler ────────────────────────────────────────────
export async function GET() {
  try {
    const apiKey = process.env.CRICKET_API_KEY;
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    // 1. Try memory cache first (fastest)
    if (memoryCache && (now - memoryCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        ...memoryCache.data,
        cacheInfo: {
          source: 'memory_cache',
          age: Math.round((now - memoryCache.timestamp) / 1000),
          maxAge: CACHE_DURATION / 1000,
          apiCallsToday: memoryCache.apiCallsMade,
          dailyLimit: 100,
        },
      });
    }

    // 2. Try disk cache (survives restarts, valid for 5 min)
    if (!memoryCache) {
      memoryCache = loadDiskCache();
    }
    if (memoryCache && (now - memoryCache.timestamp) < CACHE_DURATION) {
      return NextResponse.json({
        ...memoryCache.data,
        cacheInfo: {
          source: 'disk_cache',
          age: Math.round((now - memoryCache.timestamp) / 1000),
          maxAge: CACHE_DURATION / 1000,
          apiCallsToday: memoryCache.apiCallsMade,
          dailyLimit: 100,
        },
      });
    }

    // 3. Check daily limit before making API call
    const callsMadeToday = memoryCache?.lastResetDate === today
      ? memoryCache.apiCallsMade
      : 0;

    // Reserve 10 calls as buffer — stop at 90
    if (callsMadeToday >= 90) {
      console.warn(`⚠️ CricketData API: ${callsMadeToday}/100 calls used today. Using cache to save quota.`);
      // Return stale cache if available
      if (memoryCache?.data) {
        return NextResponse.json({
          ...memoryCache.data,
          cacheInfo: {
            source: 'quota_exceeded_cache',
            apiCallsToday: callsMadeToday,
            dailyLimit: 100,
            message: 'Daily limit nearly reached, serving cached data',
          },
        });
      }
      // Fall through to mock data
    }

    // 4. Actually call the API
    if (apiKey && apiKey.length > 5 && callsMadeToday < 90) {
      try {
        const res = await fetch(
          `https://api.cricapi.com/v1/currentMatches?apikey=${apiKey}&offset=0`,
          { cache: 'no-store' }
        );

        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const matches = data.data.map((m: any) => ({
              id: m.id,
              name: m.name || '',
              matchType: m.matchType || '',
              status: m.status || '',
              venue: m.venue || '',
              date: m.date || '',
              dateTimeGMT: m.dateTimeGMT || '',
              teams: m.teams || [],
              teamInfo: m.teamInfo || [],
              score: m.score || [],
              series_id: m.series_id || '',
              fantasyEnabled: m.fantasyEnabled || false,
              bbbEnabled: m.bbbEnabled || false,
              hasSquad: m.hasSquad || false,
              matchStarted: m.matchStarted || false,
              matchEnded: m.matchEnded || false,
            }));

            const responseData = { matches, source: 'live', lastUpdated: new Date().toISOString() };

            // Update cache
            memoryCache = {
              data: responseData,
              timestamp: now,
              apiCallsMade: callsMadeToday + 1,
              lastResetDate: today,
            };
            saveDiskCache(memoryCache);

            return NextResponse.json({
              ...responseData,
              cacheInfo: {
                source: 'fresh_api',
                apiCallsToday: callsMadeToday + 1,
                dailyLimit: 100,
                nextRefreshIn: `${CACHE_DURATION / 1000}s`,
              },
            });
          }
        }
      } catch (apiError) {
        console.error('CricketData API error:', apiError);
      }
    }

    // 5. Fallback: mock data
    const mockResponse = { matches: MOCK_MATCHES, source: 'mock', lastUpdated: new Date().toISOString() };
    memoryCache = {
      data: mockResponse,
      timestamp: now,
      apiCallsMade: callsMadeToday,
      lastResetDate: today,
    };

    return NextResponse.json({
      ...mockResponse,
      cacheInfo: {
        source: 'mock_fallback',
        apiCallsToday: callsMadeToday,
        dailyLimit: 100,
      },
    });
  } catch (error) {
    console.error('Error fetching cricket data:', error);
    return NextResponse.json(
      { matches: MOCK_MATCHES, source: 'mock', lastUpdated: new Date().toISOString() },
      { status: 200 }
    );
  }
}
