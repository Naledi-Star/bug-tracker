import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import './layout.css';

export const Layout: React.FC = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch unread notification count
  useEffect(() => {
    if (!profile) return;

    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profile.id)
        .eq('read', false);

      setUnreadCount(count || 0);
    };

    fetchUnread();

    // Subscribe to new notifications
    const channel = supabase
      .channel('notifications-layout')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `profile_id=eq.${profile.id}`,
      }, () => {
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile]);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const avatar = profile?.avatar || profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <div className="layout">
      <div className="layout-container">
        <div className="layout-sidebar">
          <Sidebar />
        </div>
        <div className="layout-content">
          {/* Top bar */}
          <div className="layout-topbar">
            <div className="layout-topbar-search">
              <Search size={16} />
              <input type="text" placeholder="Search projects, defects..." />
            </div>
            <div className="layout-topbar-right">
              <button
                className="layout-topbar-btn"
                onClick={() => navigate('/dashboard/notifications')}
                style={{ position: 'relative' }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: '#FB923C',
                    }}
                  />
                )}
              </button>
              <div
                className="layout-topbar-user"
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className="layout-topbar-user-avatar">{avatar}</div>
                <span className="layout-topbar-user-name">{profile?.name || 'Loading...'}</span>
                <ChevronDown size={14} color="#6B7280" />

                {/* Dropdown menu */}
                {showUserMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: 4,
                      background: '#141826',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 8,
                      padding: 4,
                      minWidth: 160,
                      zIndex: 100,
                    }}
                  >
                    <button
                      onClick={() => { navigate('/dashboard/settings'); setShowUserMenu(false); }}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: 13,
                        color: '#d9dff0',
                        background: 'none',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        fontSize: 13,
                        color: '#f75f6b',
                        background: 'none',
                        border: 'none',
                        borderRadius: 4,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Content */}
          <div className="layout-content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
