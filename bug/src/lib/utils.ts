import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string to a short format (DD/MM/YYYY)
 */
export function formatDateShort(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleDateString('en-GB');
}

/**
 * Format a date string to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDateShort(date);
}

/**
 * Format a time string (HH:MM)
 */
export function formatTime(dateStr: string | Date): string {
  const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Generate initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Get color for a role
 */
export function getRoleColor(role: string): { bg: string; text: string } {
  switch (role) {
    case 'admin':
      return { bg: 'rgba(155,124,244,0.15)', text: '#9b7cf4' };
    case 'manager':
      return { bg: 'rgba(155,124,244,0.15)', text: '#9b7cf4' };
    case 'developer':
      return { bg: 'rgba(251,146,60,0.15)', text: '#FB923C' };
    case 'tester':
      return { bg: 'rgba(61,214,140,0.15)', text: '#3dd68c' };
    default:
      return { bg: 'rgba(124,133,162,0.15)', text: '#7c85a2' };
  }
}

/**
 * Get color for a bug status
 */
export function getStatusColor(status: string): { bg: string; text: string; label: string } {
  const map: Record<string, { bg: string; text: string; label: string }> = {
    'open': { bg: 'rgba(251,146,60,0.15)', text: '#FB923C', label: 'Open' },
    'in-progress': { bg: 'rgba(229,164,53,0.15)', text: '#e5a435', label: 'In Progress' },
    'under-review': { bg: 'rgba(155,124,244,0.15)', text: '#9b7cf4', label: 'Under Review' },
    'resolved': { bg: 'rgba(61,214,140,0.15)', text: '#3dd68c', label: 'Resolved' },
    'closed': { bg: 'rgba(72,79,107,0.2)', text: '#7c85a2', label: 'Closed' },
    'reopened': { bg: 'rgba(247,95,107,0.15)', text: '#f75f6b', label: 'Reopened' },
    'needs-info': { bg: 'rgba(240,152,88,0.15)', text: '#f09858', label: 'Needs Info' },
  };
  return map[status] || { bg: 'rgba(124,133,162,0.15)', text: '#7c85a2', label: status };
}

/**
 * Get color for a bug priority
 */
export function getPriorityColor(priority: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    'critical': { bg: 'rgba(247,95,107,0.15)', text: '#f75f6b' },
    'high': { bg: 'rgba(240,152,88,0.15)', text: '#f09858' },
    'medium': { bg: 'rgba(229,164,53,0.15)', text: '#e5a435' },
    'low': { bg: 'rgba(61,214,140,0.15)', text: '#3dd68c' },
  };
  return map[priority] || { bg: 'rgba(124,133,162,0.15)', text: '#7c85a2' };
}

/**
 * Get color for a bug severity
 */
export function getSeverityColor(severity: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    'blocker': { bg: 'rgba(247,95,107,0.15)', text: '#f75f6b' },
    'severe': { bg: 'rgba(240,152,88,0.15)', text: '#f09858' },
    'major': { bg: 'rgba(229,164,53,0.15)', text: '#e5a435' },
    'minor': { bg: 'rgba(61,214,140,0.15)', text: '#3dd68c' },
  };
  return map[severity] || { bg: 'rgba(124,133,162,0.15)', text: '#7c85a2' };
}

/**
 * Get color for online status
 */
export function getStatusDotColor(status: string): string {
  switch (status) {
    case 'online': return '#3dd68c';
    case 'away': return '#e5a435';
    case 'offline': return '#484f6b';
    default: return '#484f6b';
  }
}

/**
 * Download data as CSV
 */
export function downloadCSV(data: Record<string, any>[], filename: string): void {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h];
        const str = val === null || val === undefined ? '' : String(val);
        return str.includes(',') ? `"${str}"` : str;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
