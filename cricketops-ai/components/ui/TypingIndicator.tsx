'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface TypingIndicatorProps {
  className?: string;
  color?: string;
}

export default function TypingIndicator({ className, color = '#3B82F6' }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-1 py-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: color }}
          animate={{ y: [0, -6, 0] }}
          transition={{
            delay: i * 0.15,
            repeat: Infinity,
            duration: 0.6,
            ease: 'easeInOut',
          }}
        />
      ))}
      <span className="ml-2 text-xs text-muted animate-pulse">AI generating...</span>
    </div>
  );
}
