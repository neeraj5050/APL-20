'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/types';
import TaskCard from './TaskCard';
import CountBadge from '@/components/ui/CountBadge';
import { cn } from '@/lib/utils/cn';

interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: 'TODO' | 'PROCESSING' | 'POSTED';
  color: string;
  icon: string;
}

export default function KanbanColumn({ title, tasks, status, color, icon }: KanbanColumnProps) {
  return (
    <div className="flex flex-1 flex-col min-w-[320px]">
      {/* Column Header */}
      <div className={cn(
        'flex items-center justify-between rounded-t-xl border border-white/[0.06] px-4 py-3 mb-3',
        'bg-white/[0.02] backdrop-blur-sm'
      )}>
        <div className="flex items-center gap-2.5">
          <span className="text-base">{icon}</span>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <CountBadge count={tasks.length} color={color} />
        </div>
        {status === 'PROCESSING' && tasks.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: color }} />
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
            </span>
            <span className="text-[10px] font-medium" style={{ color }}>Active</span>
          </div>
        )}
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto pb-4 pr-1 scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {tasks.map((task) => (
            <motion.div
              key={task.id}
              layoutId={task.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <TaskCard task={task} />
            </motion.div>
          ))}
        </AnimatePresence>

        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.06] py-12 text-center">
            <span className="text-2xl mb-2 opacity-30">📭</span>
            <p className="text-xs text-muted">No tasks in {title.toLowerCase()}</p>
          </div>
        )}
      </div>
    </div>
  );
}
