import { useState, useEffect } from 'react';
import { Bell, MessageSquare, AtSign, RotateCcw, Clock, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface NotificationItem {
  id: string;
  type: string;
  text: string;
  bug_id: string | null;
  read: boolean;
  created_at: string;
}

const typeIcons: Record<string, any> = {
  assignment: Bell,
  comment: MessageSquare,
  mention: AtSign,
  status: RotateCcw,
  reopened: RotateCcw,
  overdue: Clock,
};

const typeColors: Record<string, string> = {
  assignment: '#FB923C',
  comment: '#9b7cf4',
  mention: '#52d9c4',
  status: '#e5a435',
  reopened: '#f75f6b',
  overdue: '#f09858',
};

export const NotificationsPage = () => (<NotificationsPageInner />);
function NotificationsPageInner() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!profile?.id) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', profile.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setItems(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    const channel = supabase
      .channel('notifications-page')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${profile.id}`,
      }, (payload) => {
        setItems(prev => [payload.new as NotificationItem, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const displayed = filter === 'unread' ? items.filter(n => !n.read) : items;
  const unread = items.filter(n => !n.read).length;

  const markAllRead = async () => {
    if (!profile?.id) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('profile_id', profile.id)
      .eq('read', false);
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleNotificationClick = (n: NotificationItem) => {
    markRead(n.id);
    if (n.bug_id) {
      navigate(`/dashboard/defects/${n.bug_id}`);
    }
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffD = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffH < 24) return `${diffH}h ago`;
    if (diffD < 7) return `${diffD}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 32, height: 32,
            border: '3px solid rgba(251,146,60,0.2)',
            borderTopColor: '#FB923C',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 12px',
          }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading notifications...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto" style={{ background: '#0b0e18' }}>
      <div style={{ width: '100%' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold" style={{ color: '#e8eaf0' }}>Notifications</h1>
            {unread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: '#FB923C', color: '#fff' }}>
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
                    background: filter === f ? 'rgba(251,146,60,0.15)' : 'transparent',
                    color: filter === f ? '#FB923C' : '#7c85a2',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors"
                style={{ background: 'rgba(255,255,255,0.04)', color: '#7c85a2', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
              >
                <CheckCheck size={13} /> Mark all read
              </button>
            )}
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
            const color = typeColors[n.type] || '#FB923C';

            return (
              <div
                key={n.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer"
                style={{
                  background: !n.read ? 'rgba(251,146,60,0.04)' : 'transparent',
                  borderBottom: i < displayed.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = !n.read ? 'rgba(251,146,60,0.04)' : 'transparent')}
                onClick={() => handleNotificationClick(n)}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}20` }}>
                  <Icon size={14} color={color} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{ color: n.read ? '#7c85a2' : '#d9dff0' }}>{n.text}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#484f6b' }}>{formatTime(n.created_at)}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!n.read && <div className="w-2 h-2 rounded-full" style={{ background: '#FB923C' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
