import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Bug, FolderKanban, Users,
  BarChart3, Bell, Settings, Search, Inbox, UserCheck,
  ChevronDown, ChevronRight, Plus, LogOut, ChevronLeft
} from 'lucide-react';
import logo from '../assets/logo.png';
import { currentUser, projects } from '../data/mockData';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { id: 'bugs', icon: Bug, label: 'Bugs', path: '/defects' },
  { id: 'projects', icon: FolderKanban, label: 'Projects', path: '/projects' },
  { id: 'team', icon: Users, label: 'Team', path: '/team' },
  { id: 'reports', icon: BarChart3, label: 'Reports', path: '/reports' },
];

const roleColors: Record<string, string> = { manager: '#9b7cf4', developer: '#5c6ef8', tester: '#3dd68c' };

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({ p1: true });

  const toggleProject = (id: string) => setExpandedProjects(p => ({ ...p, [id]: !p[id] }));

  const navPath = (id: string) => {
    const item = navItems.find(i => i.id === id);
    return item?.path || '/';
  };

  const isActive = (id: string) => {
    if (id === 'dashboard') return location.pathname === '/';
    const path = navPath(id);
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <aside
      className="flex flex-col h-full border-r transition-all duration-200"
      style={{ width: collapsed ? 52 : 232, background: '#10131f', borderColor: 'rgba(255,255,255,0.07)', flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', minHeight: 56 }}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={logo} alt="Bug Tracker Logo" className="w-9 h-9 rounded-md object-cover" />
            <span className="font-semibold text-sm tracking-tight" style={{ color: '#d9dff0' }}>Bug Tracker</span>
          </div>
        )}
        {collapsed && (
          <img src={logo} alt="Bug Tracker Logo" className="w-9 h-9 rounded-md mx-auto object-cover" />
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)} className="flex items-center justify-center w-6 h-6 rounded transition-colors" style={{ color: '#484f6b' }}>
            <ChevronLeft size={14} />
          </button>
        )}
      </div>

      {/* Workspace switcher */}
      {!collapsed && (
        <div className="mx-2 mt-2 px-2 py-1.5 rounded-md cursor-pointer flex items-center gap-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
          <div className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#5c6ef8', color: '#fff', fontSize: 10 }}>S</div>
          <span className="text-xs font-medium flex-1 truncate" style={{ color: '#d9dff0' }}>Stargaze Inc</span>
          <ChevronDown size={12} color="#484f6b" />
        </div>
      )}

      {/* Search */}
      {!collapsed && (
        <div className="mx-2 mt-2">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs" style={{ color: '#484f6b', background: 'rgba(255,255,255,0.04)' }}>
            <Search size={13} /><span>Search...</span>
            <span className="ml-auto font-mono text-xs" style={{ color: '#2e3450', fontSize: 10 }}>⌘K</span>
          </button>
        </div>
      )}

      {/* Personal items */}
      <div className="mt-3 px-2 space-y-0.5">
        <NavItem icon={Inbox} label="Inbox" collapsed={collapsed} active={location.pathname === '/messages'} onClick={() => navigate('/messages')} />
        <NavItem icon={UserCheck} label="Assigned to me" collapsed={collapsed} active={false} onClick={() => navigate('/defects')} />
      </div>

      {/* Main Nav */}
      <div className="mt-3 px-2 space-y-0.5">
        {!collapsed && <p className="px-2 mb-1 text-xs font-medium uppercase tracking-wider" style={{ color: '#2e3450', fontSize: 10 }}>Navigation</p>}
        {navItems.map(item => (
          <NavItem key={item.id} icon={item.icon} label={item.label} collapsed={collapsed} active={isActive(item.id)} onClick={() => navigate(item.path)} />
        ))}
        <NavItem icon={Bell} label="Notifications" collapsed={collapsed} active={location.pathname === '/notifications'} onClick={() => navigate('/notifications')} />
        <NavItem icon={Settings} label="Settings" collapsed={collapsed} active={location.pathname === '/settings'} onClick={() => navigate('/settings')} />
      </div>

      {/* Projects */}
      {!collapsed && (
        <div className="mt-4 px-2 flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-2 mb-1">
            <p className="text-xs font-medium uppercase tracking-wider" style={{ color: '#2e3450', fontSize: 10 }}>Projects</p>
            <button className="w-5 h-5 flex items-center justify-center rounded" style={{ color: '#484f6b' }} onClick={() => navigate('/projects/new')}><Plus size={12} /></button>
          </div>
          {projects.map(p => (
            <div key={p.id}>
              <button className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-xs" style={{ color: location.pathname.includes(p.id) ? '#d9dff0' : '#7c85a2', background: location.pathname.includes(p.id) ? 'rgba(255,255,255,0.07)' : 'transparent' }} onClick={() => { toggleProject(p.id); navigate('/projects/' + p.id); }}>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
                <span className="truncate flex-1 text-left">{p.name}</span>
                {expandedProjects[p.id] ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
              </button>
              {expandedProjects[p.id] && (
                <div className="ml-4 mt-0.5 space-y-0.5">
                  {['Issues', 'Board', 'Reports'].map(sub => (
                    <button key={sub} className="w-full text-left px-2 py-0.5 rounded text-xs" style={{ color: '#484f6b' }}>{sub}</button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />

      {/* Expand button when collapsed */}
      {collapsed && (
        <button onClick={() => setCollapsed(false)} className="mx-auto mb-2 flex items-center justify-center w-7 h-7 rounded-md" style={{ color: '#484f6b' }}>
          <ChevronRight size={14} />
        </button>
      )}

      {/* User */}
      <div className="flex items-center gap-2 mx-2 mb-2 px-2 py-2 rounded-md cursor-pointer" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginTop: 4 }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0" style={{ background: '#5c6ef8', color: '#fff' }}>{currentUser.avatar}</div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate" style={{ color: '#d9dff0' }}>{currentUser.name}</div>
            <div className="text-xs capitalize" style={{ color: roleColors[currentUser.role] }}>{currentUser.role}</div>
          </div>
        )}
        {!collapsed && <LogOut size={13} color="#484f6b" />}
      </div>
    </aside>
  );
}

function NavItem({ icon: Icon, label, collapsed, active, onClick }: { icon: any; label: string; collapsed: boolean; active?: boolean; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors"
      style={{ color: active ? '#d9dff0' : hovered ? '#a0a8c0' : '#7c85a2', background: active ? 'rgba(92,110,248,0.12)' : hovered ? 'rgba(255,255,255,0.04)' : 'transparent', justifyContent: collapsed ? 'center' : 'flex-start' }}
      title={collapsed ? label : undefined}>
      <Icon size={15} color={active ? '#5c6ef8' : hovered ? '#a0a8c0' : '#7c85a2'} />
      {!collapsed && <span className="flex-1 text-left font-medium">{label}</span>}
    </button>
  );
}
