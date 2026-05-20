'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMatchStore } from '@/store/matchStore';
import { useLiveMatch } from '@/hooks/useLiveMatch';
import PulsingDot from '@/components/ui/PulsingDot';
import { cn } from '@/lib/utils/cn';
import {
  LayoutDashboard,
  Bot,
  BarChart3,
  Rss,
  Bell,
  Search,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
  Zap,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/feed', label: 'Activity Feed', icon: Rss },
];

export default function TopBar() {
  const pathname = usePathname();
  const { matchContext, isLive } = useMatchStore();
  const { source, cacheInfo, lastFetched, refreshMatches, matches } = useLiveMatch();
  const isLiveApi = source === 'live';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-topbar backdrop-blur-xl px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Brand Logo & Navigation */}
      <div className="flex flex-wrap items-center gap-6 w-full md:w-auto">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg shadow-lg shadow-blue-500/10 group-hover:scale-105 transition-all">
            🏏
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-blue-400 transition-colors">
              CricketOps AI
            </h1>
            <p className="text-[9px] text-muted uppercase tracking-widest flex items-center gap-1 mt-0.5">
              <PulsingDot size="sm" color="#10B981" />
              Live Ops
            </p>
          </div>
        </Link>

        {/* Vertical divider */}
        <div className="hidden sm:block h-6 w-px bg-white/[0.08]" />

        {/* Navigation links */}
        <nav className="flex items-center gap-1 bg-white/[0.02] border border-white/[0.04] p-0.5 rounded-xl">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-white/[0.08] text-white shadow-md shadow-black/20'
                    : 'text-muted hover:text-white hover:bg-white/[0.04]'
                )}
              >
                <item.icon className={cn('h-3.5 w-3.5', isActive ? 'text-blue-400' : '')} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Score, API status, Notifications, Profile */}
      <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 w-full md:w-auto">
        {/* Active Agents Badge */}
        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/20 px-3 py-1.5">
          <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          <div className="text-left">
            <p className="text-[10px] font-bold text-white leading-none">2 Agents Active</p>
            <p className="text-[8px] text-muted mt-0.5">😂 Meme • 📊 Prediction</p>
          </div>
        </div>

        {/* Match Score widget */}
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06] px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white">{matchContext.team1}</span>
            <span className="text-[10px] text-muted">vs</span>
            <span className="text-xs font-bold text-white">{matchContext.team2}</span>
          </div>
          <div className="h-3.5 w-px bg-white/10" />
          <span className="text-xs font-mono font-bold text-blue-400">
            {matchContext.score}
          </span>
          <span className="text-[10px] text-muted">({matchContext.overs} ov)</span>
          {isLive ? (
            <div className="flex items-center gap-1 ml-0.5">
              <PulsingDot color="#EF4444" size="sm" />
              <span className="text-[8px] font-extrabold text-red-400 uppercase tracking-wider">Live</span>
            </div>
          ) : (
            isLiveApi && (
              <span className="text-[8px] font-bold text-muted bg-white/[0.06] px-1 py-0.5 rounded uppercase tracking-wider">
                Recent
              </span>
            )
          )}
        </div>

        {/* API connection and Quota badge */}
        <div className="flex items-center gap-1.5">
          {/* Connection status */}
          <div
            className={cn(
              'flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[10px] border font-medium',
              isLiveApi
                ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                : source === 'loading'
                ? 'border-white/10 bg-white/5 text-muted'
                : 'border-amber-500/20 bg-amber-500/5 text-amber-400'
            )}
          >
            {isLiveApi ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{isLiveApi ? 'Live API' : source === 'loading' ? 'Loading' : 'Demo'}</span>
          </div>

          {/* Quota */}
          {cacheInfo && (
            <div
              className="flex items-center gap-1 rounded-xl bg-white/[0.04] border border-white/[0.06] px-2.5 py-1.5 cursor-help"
              title={`Cache: ${cacheInfo.source}\nAPI calls today: ${cacheInfo.apiCallsToday}/${cacheInfo.dailyLimit}\nMatches: ${matches.length}\nLast fetch: ${lastFetched}`}
            >
              <Database className="h-3 w-3 text-muted" />
              <span className="text-[10px] font-mono text-muted">
                {cacheInfo.apiCallsToday}/{cacheInfo.dailyLimit}
              </span>
            </div>
          )}

          {/* Refresh Action */}
          <button
            onClick={refreshMatches}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted hover:text-white hover:bg-white/[0.08] transition-all active:scale-95"
            title="Refresh Match Data"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>

        {/* Global actions and Avatar */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-px bg-white/[0.08]" />
          <button className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted hover:text-white hover:bg-white/[0.08] transition-all">
            <Search className="h-3.5 w-3.5" />
          </button>
          <button className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] text-muted hover:text-white hover:bg-white/[0.08] transition-all">
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 text-xs font-bold text-white shadow">
            A
          </div>
        </div>
      </div>
    </header>
  );
}
