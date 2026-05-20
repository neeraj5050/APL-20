'use client';
import { cn } from '@/lib/utils/cn';
import { ReactNode } from 'react';

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowing?: boolean;
  glowColor?: string;
  onClick?: () => void;
}

export default function GlowCard({ children, className, glowing, glowColor = '#3B82F6', onClick }: GlowCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-xl border border-white/[0.06] bg-card backdrop-blur-md transition-all duration-300',
        glowing && 'glow-card',
        onClick && 'cursor-pointer hover:border-white/[0.12] hover:bg-card-hover',
        className
      )}
      style={glowing ? { '--glow-color': glowColor } as React.CSSProperties : undefined}
    >
      {children}
    </div>
  );
}
