import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, FolderOpen, Plus, ArrowRight, Clock, CheckCircle2, Bug } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects } = useProjects(profile?.company_id || null);
  const [bugs, setBugs] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchData = async () => {
      // Fetch bugs
      const { data: bugData } = await supabase
        .from('bugs')
        .select('*, projects(name)')
        .order('created_at', { ascending: false })
        .limit(50);

      // Fetch team
      const { data: teamData } = await supabase
        .from('profiles')
        .select('id, name, avatar, role, status')
        .eq('company_id', profile.company_id);

      setBugs(bugData || []);
      setTeamMembers(teamData || []);
      setLoading(false);
    };

    fetchData();
  }, [profile?.company_id]);

  const totalDefects = bugs.length;
  const openDefects = bugs.filter(b => ['open', 'in_progress', 'under_review'].includes(b.status)).length;
  const resolvedDefects = bugs.filter(b => ['resolved', 'closed'].includes(b.status)).length;
  const criticalDefects = bugs.filter(b => b.priority === 'critical' || b.severity === 'blocker').length;

  const recentDefects = bugs.slice(0, 5);

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'open': { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' },
      'assigned': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'in_progress': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'under_review': { background: 'rgba(168,85,247,0.15)', color: '#D8B4FE' },
      'resolved': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'closed': { background: 'rgba(100,116,139,0.2)', color: '#9CA3AF' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, ...s[status] };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'medium': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'high': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'critical': { background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
      'blocker': { background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, ...s[severity] };
  };

  const stats = [
    { label: 'Total Defects', value: totalDefects, icon: Bug, color: '#818CF8', bg: 'rgba(99,102,241,0.12)' },
    { label: 'Open Issues', value: openDefects, icon: Clock, color: '#FDE047', bg: 'rgba(250,204,21,0.12)' },
    { label: 'Resolved', value: resolvedDefects, icon: CheckCircle2, color: '#86EFAC', bg: 'rgba(34,197,94,0.12)' },
    { label: 'Critical', value: criticalDefects, icon: AlertTriangle, color: '#FCA5A5', bg: 'rgba(239,68,68,0.12)' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#6366F1';
      case 'manager': return '#8B5CF6';
      case 'developer': return '#FB923C';
      case 'tester': return '#3dd68c';
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
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>
            Welcome back, {profile?.name?.split(' ')[0] || 'User'}
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            Here's what's happening today.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => navigate('/dashboard/projects/new')}>
            <FolderOpen className="w-4 h-4" /> New Project
          </Button>
          <Button onClick={() => navigate('/dashboard/defects/new')}>
            <Plus className="w-4 h-4" /> Report Defect
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardContent style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 500, color: '#6B7280' }}>{stat.label}</p>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#F8FAFC', marginTop: 4, letterSpacing: '-0.03em' }}>{stat.value}</p>
                </div>
                <div style={{ background: stat.bg, width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <stat.icon size={20} color={stat.color} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>Recent Defects</h2>
            <button onClick={() => navigate('/dashboard/defects')} style={{ fontSize: 12, fontWeight: 600, color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
              View all <ArrowRight size={14} />
            </button>
          </div>
          <CardContent style={{ padding: '12px 24px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recentDefects.length === 0 && (
                <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', padding: 20 }}>No defects yet</p>
              )}
              {recentDefects.map((bug) => (
                <div key={bug.id} onClick={() => navigate(`/dashboard/defects/${bug.id}`)} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bug.title}</p>
                    <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>{bug.projects?.name || 'Unknown Project'}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={getSeverityStyle(bug.severity)}>{bug.severity}</span>
                    <span style={getStatusStyle(bug.status)}>{bug.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Card>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px 0' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>Projects</h2>
              <button onClick={() => navigate('/dashboard/projects')} style={{ fontSize: 12, fontWeight: 600, color: '#818CF8', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                View all <ArrowRight size={14} />
              </button>
            </div>
            <CardContent style={{ padding: '12px 24px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {projects.length === 0 && (
                  <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', padding: 10 }}>No projects yet</p>
                )}
                {projects.slice(0, 4).map((project) => (
                  <div key={project.id} onClick={() => navigate(`/dashboard/projects/${project.id}`)} style={{ padding: '12px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{project.name}</p>
                      <span style={getStatusStyle(project.status === 'active' ? 'resolved' : 'assigned')}>{project.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent style={{ padding: 20 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC', marginBottom: 16 }}>Team</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {teamMembers.slice(0, 5).map((user) => (
                  <div key={user.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg, ${getRoleColor(user.role)}, ${getRoleColor(user.role)}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                      {user.avatar || user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: '#6B7280', textTransform: 'capitalize' }}>{user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
