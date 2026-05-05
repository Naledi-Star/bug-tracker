import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import './layout.css';

export const Layout: React.FC = () => {
  return (
    <div className="layout">
      <div className="layout-container">
        <div className="layout-sidebar">
          <Sidebar />
        </div>
        <div className="layout-content">
          <div className="layout-content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
