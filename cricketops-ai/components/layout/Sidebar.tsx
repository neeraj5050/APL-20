'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils/cn';
import { LayoutDashboard, Bot, BarChart3, Rss, Zap } from 'lucide-react';
import PulsingDot from '@/components/ui/PulsingDot';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/agents', label: 'Agents', icon: Bot },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/feed', label: 'Activity Feed', icon: Rss },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-sidebar backdrop-blur-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/[0.06]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-lg">
          🏏
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">CricketOps AI</h1>
          <p className="text-[10px] text-muted uppercase tracking-widest flex items-center gap-1.5">
            <PulsingDot size="sm" color="#10B981" />
            Live Operations
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white/[0.08] text-white shadow-lg shadow-blue-500/5'
                  : 'text-muted hover:bg-white/[0.04] hover:text-white'
              )}
            >
              <item.icon className={cn('h-5 w-5', isActive ? 'text-blue-400' : '')} />
              {item.label}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-4 py-4">
        <div className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500/10 to-blue-500/10 border border-amber-500/20 px-3 py-2.5">
          <Zap className="h-4 w-4 text-amber-400" />
          <div>
            <p className="text-xs font-medium text-white">2 Agents Active</p>
            <p className="text-[10px] text-muted">😂 Meme • 📊 Prediction</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
