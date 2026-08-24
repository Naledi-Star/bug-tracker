import React from 'react';
import { Outlet } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { currentUser } from '../data/mockData';
import './layout.css';

export const Layout: React.FC = () => {
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
              <button className="layout-topbar-btn">
                <Bell size={18} />
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: '#5c6ef8' }} />
              </button>
              <div className="layout-topbar-user">
                <div className="layout-topbar-user-avatar">{currentUser.avatar}</div>
                <span className="layout-topbar-user-name">{currentUser.name}</span>
                <ChevronDown size={14} color="#6B7280" />
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
