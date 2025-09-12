import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { Home, FolderOpen, Bug, Settings, LogOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navigationItems = [
    { name: "Home", id: "home", path: "/", icon: Home },
    { name: "Projects", id: "projects", path: "/projects", icon: FolderOpen },
    { name: "Defects", id: "defects", path: "/defects", icon: Bug },
    { name: "Settings", id: "settings", path: "/settings", icon: Settings },
  ];

  const handleNavigation = (path: string, id: string) => {
    if (id === 'logout') {
      
      console.log('Logout clicked');
      return;
    }
    navigate(path);
  };

  return (
    <nav className="h-full bg-gradient-to-b from-blue-600 to-blue-800 rounded-lg shadow-lg m-4">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold">Bug Tracker</h1>
        </div>
        
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <div
              key={item.id}
              onClick={() => handleNavigation(item.path, item.id)}
              className={cn(
                "flex items-center px-6 py-4 mb-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-500/20",
                isActive
                  ? "bg-blue-200 text-blue-900 font-bold shadow-md"
                  : "text-white hover:text-blue-100"
              )}
            >
              <Icon className="w-5 h-5 mr-3" />
              <span className="text-lg">{item.name}</span>
            </div>
          );
        })}
        
        {/* Logout Button */}
        <div
          onClick={() => handleNavigation('/', 'logout')}
          className="flex items-center px-6 py-4 mb-2 rounded-lg cursor-pointer transition-all duration-200 hover:bg-red-500/20 text-white hover:text-red-100 mt-8"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="text-lg">Logout</span>
        </div>
      </div>
    </nav>
  );
};