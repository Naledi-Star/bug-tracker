import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus, Users, Calendar, FolderOpen, LayoutGrid, List, TrendingDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, Bar } from 'recharts';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { KanbanBoard } from '../components/KanbanBoard';
import { BurndownChart } from '../components/BurndownChart';

interface ProjectMember {
  profile_id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

interface ProjectBug {
  id: string;
  title: string;
  description: string | null;
  status: string;
  severity: string;
  priority: string;
  reporter_name: string;
  assignee_name: string | null;
  created_at: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  color: string;
  created_at: string;
  is_archived: boolean;
}

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [bugs, setBugs] = useState<ProjectBug[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board');
  const [showBurndown, setShowBurndown] = useState(false);

  // Track the current user's own moves to avoid duplicate updates
  const lastOwnMoveRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;

    const fetchProject = async () => {
      setLoading(true);

      const { data: projectData } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectData) {
        setProject(projectData);

        const { data: memberData } = await supabase
          .from('project_members')
          .select('profile_id, profiles(name, email, avatar, role)')
          .eq('project_id', id);

        if (memberData) {
          setMembers(memberData.map((m: any) => ({
            profile_id: m.profile_id,
            name: m.profiles?.name || 'Unknown',
            email: m.profiles?.email || '',
            avatar: m.profiles?.avatar || '??',
            role: m.profiles?.role || 'developer',
          })));
        }

        const { data: bugData } = await supabase
          .from('bugs')
          .select('id, title, description, status, severity, priority, created_at, updated_at')
          .eq('project_id', id)
          .eq('is_archived', false)
          .order('created_at', { ascending: false });

        if (bugData) {
          setBugs(bugData);
        }
      }

      setLoading(false);
    };

    fetchProject();

    // Subscribe to real-time bug updates for this project
    const channel = supabase
      .channel(`project-bugs-${id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bugs',
        filter: `project_id=eq.${id}`,
      }, (payload) => {
        const newRecord = payload.new as any;
        const eventType = payload.eventType;

        if (eventType === 'UPDATE') {
          // Skip if this was our own recent move (already updated optimistically)
          const lastMove = lastOwnMoveRef.current[newRecord.id];
          if (lastMove && Date.now() - lastMove < 2000) return;

          setBugs(prev => prev.map(b =>
            b.id === newRecord.id
              ? { ...b, title: newRecord.title, status: newRecord.status, severity: newRecord.severity, priority: newRecord.priority, description: newRecord.description }
              : b
          ));
        } else if (eventType === 'INSERT' && !newRecord.is_archived) {
          // New bug added to this project
          setBugs(prev => [{
            id: newRecord.id,
            title: newRecord.title,
            description: newRecord.description,
            status: newRecord.status,
            severity: newRecord.severity,
            priority: newRecord.priority,
            reporter_name: '',
            assignee_name: null,
            created_at: newRecord.created_at,
          }, ...prev]);
        } else if (eventType === 'DELETE') {
          setBugs(prev => prev.filter(b => b.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const handleBugMove = async (bugId: string, newStatus: string) => {
    // Record this move so the real-time subscription doesn't double-update
    lastOwnMoveRef.current[bugId] = Date.now();

    // Update local state immediately for optimistic UI
    setBugs(prev => prev.map(b => b.id === bugId ? { ...b, status: newStatus } : b));

    // Update in Supabase
    const { error } = await supabase
      .from('bugs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bugId);

    if (error) {
      // Revert on error
      setBugs(prev => prev.map(b => b.id === bugId ? { ...b, status: b.status } : b));
    } else {
      // Log activity
      if (profile?.id) {
        await supabase.from('bug_activity').insert({
          bug_id: bugId,
          actor_id: profile.id,
          action: 'status_changed',
          detail: `Status changed to ${newStatus.replace('_', ' ')}`,
        });
      }
    }
  };

  const handleBatchMove = async (bugIds: string[], newStatus: string) => {
    setBugs(prev => prev.map(b => bugIds.includes(b.id) ? { ...b, status: newStatus } : b));
    const { error } = await supabase
      .from('bugs')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .in('id', bugIds);
    if (error) {
      setBugs(prev => prev.map(b => bugIds.includes(b.id) ? { ...b, status: b.status } : b));
    }
  };

  const handleBatchDelete = async (bugIds: string[]) => {
    setBugs(prev => prev.filter(b => !bugIds.includes(b.id)));
    const { error } = await supabase
      .from('bugs')
      .delete()
      .in('id', bugIds);
    if (error) {
      fetchProject();
    }
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'open': { background: 'rgba(251,146,60,0.15)', color: '#FB923C' },
      'in_progress': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'assigned': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'under_review': { background: 'rgba(155,124,244,0.15)', color: '#9b7cf4' },
      'resolved': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'closed': { background: 'rgba(72,79,107,0.2)', color: '#7c85a2' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6, ...(s[status] || s['open']) };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'medium': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'high': { background: 'rgba(240,152,88,0.15)', color: '#f09858' },
      'blocker': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6, ...(s[severity] || s['low']) };
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'medium': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'high': { background: 'rgba(240,152,88,0.15)', color: '#f09858' },
      'critical': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6, ...(s[priority] || s['medium']) };
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#6366F1';
      case 'manager': return '#6366F1';
      case 'developer': return '#8B5CF6';
      case 'tester': return '#F59E0B';
      default: return '#6B7280';
    }
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
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading project...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <FolderOpen style={{ width: 48, height: 48, color: "#4B5563", margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>Project not found</h2>
        <Button onClick={() => navigate('/dashboard/projects')}>
          <ArrowLeft style={{ width: 16, height: 16, marginRight: 6 }} />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate('/dashboard/projects')} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>{project.name}</h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{project.description || 'No description'}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/dashboard/projects/${id}/defects/new`)}>
          <Plus style={{ width: 16, height: 16, marginRight: 6 }} />
          Report Defect
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Status</p>
          <span style={{
            ...(project.status === 'active' ? { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' } :
              project.status === 'completed' ? { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' } :
              { background: 'rgba(250,204,21,0.15)', color: '#FDE047' }),
            fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6
          }}>
            {project.status.replace('-', ' ')}
          </span>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Created</p>
          <div className="flex items-center gap-1.5">
            <Calendar size={14} style={{ color: "#4B5563" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{new Date(project.created_at).toLocaleDateString('en-GB')}</span>
          </div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Team</p>
          <div className="flex items-center gap-1.5">
            <Users size={14} style={{ color: "#4B5563" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{members.length} members</span>
          </div>
        </div>
      </div>

      {/* Burndown Chart */}
      {bugs.length > 0 && (
        <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
          <div className="flex items-center justify-between mb-4">
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 8 }}>
              <TrendingDown size={16} color="#FB923C" /> Burndown Chart
            </h2>
            <button
              onClick={() => setShowBurndown(!showBurndown)}
              className="text-xs px-2 py-1 rounded-md transition-colors"
              style={{ color: '#FB923C', background: showBurndown ? 'rgba(251,146,60,0.12)' : 'transparent' }}
            >
              {showBurndown ? 'Hide' : 'Show'}
            </button>
          </div>

          {showBurndown && <BurndownChart bugs={bugs} projectCreated={project.created_at} />}

          {!showBurndown && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#FB923C' }} />
                <span className="text-xs" style={{ color: '#7c85a2' }}>Total: {bugs.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#3dd68c' }} />
                <span className="text-xs" style={{ color: '#7c85a2' }}>Resolved: {bugs.filter(b => ['resolved', 'closed'].includes(b.status)).length}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: '#f09858' }} />
                <span className="text-xs" style={{ color: '#7c85a2' }}>Open: {bugs.filter(b => !['resolved', 'closed'].includes(b.status)).length}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Team Members */}
      <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 12 }}>Team</h2>
        <div className="flex flex-wrap gap-3">
          {members.map(member => (
            <div key={member.profile_id} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: `${getRoleColor(member.role)}20`, color: getRoleColor(member.role) }}>
                {member.avatar?.length <= 2 ? member.avatar : member.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
              </div>
              <div>
                <p className="text-xs font-medium" style={{ color: '#d9dff0' }}>{member.name}</p>
                <p className="text-xs capitalize" style={{ color: '#484f6b' }}>{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bugs Section with View Toggle */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>Bugs ({bugs.length})</h2>
          <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setViewMode('board')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'board' ? 'rgba(251,146,60,0.15)' : 'transparent',
                color: viewMode === 'board' ? '#FB923C' : '#7c85a2',
              }}
            >
              <LayoutGrid size={13} /> Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
              style={{
                background: viewMode === 'list' ? 'rgba(251,146,60,0.15)' : 'transparent',
                color: viewMode === 'list' ? '#FB923C' : '#7c85a2',
              }}
            >
              <List size={13} /> List
            </button>
          </div>
        </div>

        {bugs.length === 0 ? (
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 40, textAlign: 'center' }}>
            <p style={{ color: '#7c85a2', fontSize: 14, marginBottom: 8 }}>No bugs in this project yet</p>
            <Button onClick={() => navigate(`/dashboard/projects/${id}/defects/new`)} size="sm">
              <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
              Report First Bug
            </Button>
          </div>
        ) : viewMode === 'board' ? (
          <KanbanBoard
            bugs={bugs}
            teamMembers={members.map(m => ({ id: m.profile_id, name: m.name, avatar: m.avatar, role: m.role }))}
            onStatusChange={handleBugMove}
            onBatchMove={handleBatchMove}
            onBatchDelete={handleBatchDelete}
          />
        ) : (
          /* List View */
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", overflow: 'hidden' }}>
            <div className="grid" style={{ gridTemplateColumns: '1fr 100px 100px 100px 100px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
              <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Bug</span>
              <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Status</span>
              <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Priority</span>
              <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Severity</span>
              <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Assignee</span>
            </div>
            {bugs.map((bug, i) => (
              <div
                key={bug.id}
                className="grid cursor-pointer transition-colors"
                style={{
                  gridTemplateColumns: '1fr 100px 100px 100px 100px',
                  padding: '12px 16px',
                  borderBottom: i < bugs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
                onClick={() => navigate(`/dashboard/defects/${bug.id}`)}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span className="text-xs font-medium truncate" style={{ color: '#d9dff0' }}>{bug.title}</span>
                <span style={getStatusStyle(bug.status)} className="text-center">{bug.status.replace('_', ' ')}</span>
                <span style={getPriorityStyle(bug.priority)} className="text-center">{bug.priority}</span>
                <span style={getSeverityStyle(bug.severity)} className="text-center">{bug.severity}</span>
                <span className="text-xs text-center" style={{ color: '#7c85a2' }}>{bug.assignee_name || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
