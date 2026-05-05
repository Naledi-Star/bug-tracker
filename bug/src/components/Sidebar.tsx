import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, FolderOpen, Bug, Settings, LogOut, Menu, X } from 'lucide-react';
import './sidebar.css';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close sidebar on window resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const navigationItems = [
    { name: "Home", id: "home", path: "/", icon: Home },
    { name: "Projects", id: "projects", path: "/projects", icon: FolderOpen },
    { name: "Defects", id: "defects", path: "/defects", icon: Bug },
    { name: "Settings", id: "settings", path: "/settings", icon: Settings },
  ];

  const handleNavigation = (path: string, id: string) => {
    if (id === 'logout') {
      console.log('Logout clicked');
      setIsOpen(false);
      return;
    }
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close menu" : "Open menu"}
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <nav className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-container">
          <div className="sidebar-brand">
            <h1>Bug Tracker</h1>
          </div>

          <div className="sidebar-nav">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <div
                  key={item.id}
                  onClick={() => handleNavigation(item.path, item.id)}
                  className={`sidebar-item ${isActive ? 'active' : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleNavigation(item.path, item.id);
                    }
                  }}
                >
                  <Icon className="sidebar-item-icon" />
                  <span className="sidebar-item-label">{item.name}</span>
                </div>
              );
            })}
          </div>

          <div
            onClick={() => handleNavigation('/', 'logout')}
            className="sidebar-logout"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigation('/', 'logout');
              }
            }}
          >
            <LogOut className="sidebar-logout-icon" />
            <span className="sidebar-logout-label">Logout</span>
          </div>
        </div>
      </nav>
    </>
  );
};
