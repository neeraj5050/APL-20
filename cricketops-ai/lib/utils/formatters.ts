import { formatDistanceToNow, format } from 'date-fns';

export function relativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatTime(date: string | Date): string {
  return format(new Date(date), 'HH:mm:ss');
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
}

export function generateTaskId(): string {
  return `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}
