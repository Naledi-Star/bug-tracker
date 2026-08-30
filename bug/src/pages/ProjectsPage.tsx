import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, Plus, Users, Calendar, FolderOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';

interface ProjectMember {
  profile_id: string;
  name: string;
  avatar: string;
  role: string;
}

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { projects, loading } = useProjects(profile?.company_id || null);
  const [searchTerm, setSearchTerm] = useState('');
  const [projectMembers, setProjectMembers] = useState<Record<string, ProjectMember[]>>({});

  useEffect(() => {
    if (projects.length === 0) return;

    const fetchMembers = async () => {
      const memberMap: Record<string, ProjectMember[]> = {};

      await Promise.all(
        projects.map(async (project) => {
          const { data } = await supabase
            .from('project_members')
            .select('profile_id, profiles(name, avatar, role)')
            .eq('project_id', project.id);

          if (data) {
            memberMap[project.id] = data.map((m: any) => ({
              profile_id: m.profile_id,
              name: m.profiles?.name || 'Unknown',
              avatar: m.profiles?.avatar || '??',
              role: m.profiles?.role || 'developer',
            }));
          }
        })
      );

      setProjectMembers(memberMap);
    };

    fetchMembers();
  }, [projects]);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'active': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'completed': { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' },
      'on-hold': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, ...s[status] };
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB');
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
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading projects...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Projects</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Manage your projects and track their progress</p>
        </div>
        <Button onClick={() => navigate('/dashboard/projects/new')}>
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </div>

      <div style={{ position: 'relative' }}>
        <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4B5563', width: 16, height: 16 }} />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 14px 10px 38px', background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, fontSize: 13, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
        {filteredProjects.map((project) => {
          const members = projectMembers[project.id] || [];
          return (
            <div
              key={project.id}
              onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 20, cursor: 'pointer', transition: 'all 0.15s ease' }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${project.color}20` }}>
                  <FolderOpen size={20} color={project.color} />
                </div>
                <span style={getStatusStyle(project.status)}>{project.status.replace('-', ' ')}</span>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{project.name}</h3>
              <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5, marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description || 'No description'}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: '#4B5563' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} />
                  {formatDate(project.created_at)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={13} />
                  {project.member_count} members
                </div>
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex' }}>
                  {members.slice(0, 4).map((member, i) => (
                    <div
                      key={member.profile_id}
                      style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${getRoleColor(member.role)}, ${getRoleColor(member.role)}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, border: '2px solid #1a1a2e', marginLeft: i > 0 ? -8 : 0, position: 'relative', zIndex: 4 - i }}
                    >
                      {member.avatar}
                    </div>
                  ))}
                </div>
                <span style={{ fontSize: 11.5, color: '#6B7280', marginLeft: 10 }}>{project.member_count} members</span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 48, textAlign: 'center' }}>
          <FolderOpen size={40} color="#4B5563" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>No projects found</h3>
          <p style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 16 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/dashboard/projects/new')} size="sm">
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
