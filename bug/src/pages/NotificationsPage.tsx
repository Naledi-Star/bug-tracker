import { useState } from 'react';
import { Bell, Check, AlertTriangle, MessageSquare, AtSign, RotateCcw, Clock, CheckCheck } from 'lucide-react';
import { notifications } from '../data/mockData';

const typeIcons: Record<string, any> = {
  assignment: Bell,
  comment: MessageSquare,
  mention: AtSign,
  status: RotateCcw,
  reopened: RotateCcw,
  overdue: Clock,
};

const typeColors: Record<string, string> = {
  assignment: '#5c6ef8',
  comment: '#9b7cf4',
  mention: '#52d9c4',
  status: '#e5a435',
  reopened: '#f75f6b',
  overdue: '#f09858',
};

export const NotificationsPage = () => (<NotificationsPageInner />);
function NotificationsPageInner() {
  const [items, setItems] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const displayed = filter === 'unread' ? items.filter(n => !n.read) : items;
  const unread = items.filter(n => !n.read).length;

  const markAllRead = () => setItems(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id: string) => setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffH = Math.floor((now.getTime() - d.getTime()) / 3600000);
    if (diffH < 1) return 'Just now';
    if (diffH < 24) return `${diffH}h ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#0b0e18' }}>
      <div style={{ width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: '#e8eaf0' }}>Notifications</h1>
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#5c6ef8', color: '#fff' }}>
                {unread} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {(['all', 'unread'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="px-3 py-1 rounded text-xs font-medium capitalize transition-colors"
                  style={{
                    background: filter === f ? 'rgba(92,110,248,0.15)' : 'transparent',
                    color: filter === f ? '#5c6ef8' : '#7c85a2',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', color: '#7c85a2', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          {displayed.length === 0 && (
            <div className="py-16 flex flex-col items-center" style={{ background: '#141826' }}>
              <Bell size={28} color="#484f6b" />
              <p className="mt-3 text-sm" style={{ color: '#7c85a2' }}>No {filter === 'unread' ? 'unread ' : ''}notifications</p>
            </div>
          )}

          {displayed.map((n, i) => {
            const Icon = typeIcons[n.type] || Bell;
            const color = typeColors[n.type] || '#5c6ef8';

            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                style={{
                  background: !n.read ? 'rgba(92,110,248,0.04)' : 'transparent',
                  borderBottom: i < displayed.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(92,110,248,0.04)' : 'transparent')}
                onClick={() => markRead(n.id)}
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}20` }}>
                  <Icon size={14} color={color} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: n.read ? '#7c85a2' : '#d9dff0' }}>{n.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#484f6b' }}>{formatTime(n.timestamp)}</p>
                </div>

                {/* Unread dot + action */}
                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && <div className="w-2 h-2 rounded-full" style={{ background: '#5c6ef8' }} />}
                  {!n.read && (
                    <button
                      className="p-1 rounded transition-colors"
                      style={{ color: '#484f6b' }}
                      onClick={e => { e.stopPropagation(); markRead(n.id); }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#7c85a2')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#484f6b')}
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
