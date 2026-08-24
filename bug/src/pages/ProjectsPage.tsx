import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, Plus, Users, Calendar, FolderOpen } from 'lucide-react';
import { mockProjects } from '../data/mockData';
import { Project } from '../types';

export const ProjectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [projects] = useState<Project[]>(mockProjects);

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'manager': return '#6366F1';
      case 'developer': return '#8B5CF6';
      case 'tester': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Projects</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Manage your projects and track their progress</p>
        </div>
        <Button onClick={() => navigate('/projects/new')}>
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
        {filteredProjects.map((project) => (
          <div
            key={project.id}
            onClick={() => navigate(`/projects/${project.id}`)}
            style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 20, cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(99,102,241,0.12)' }}>
                <FolderOpen size={20} color="#818CF8" />
              </div>
              <span style={getStatusStyle(project.status)}>{project.status.replace('-', ' ')}</span>
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 4 }}>{project.name}</h3>
            <p style={{ fontSize: 12.5, color: '#6B7280', lineHeight: 1.5, marginBottom: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{project.description}</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11.5, color: '#4B5563' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Calendar size={13} />
                {project.createdAt.toLocaleDateString('en-GB')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Users size={13} />
                {project.members.length} members
              </div>
            </div>
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex' }}>
                {project.members.slice(0, 4).map((member, i) => (
                  <div
                    key={member.id}
                    style={{ width: 26, height: 26, borderRadius: '50%', background: `linear-gradient(135deg, ${getRoleColor(member.role)}, ${getRoleColor(member.role)}dd)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 10, fontWeight: 700, border: '2px solid #1a1a2e', marginLeft: i > 0 ? -8 : 0, position: 'relative', zIndex: 4 - i }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                ))}
              </div>
              <span style={{ fontSize: 11.5, color: '#6B7280', marginLeft: 10 }}>{project.members.length} members</span>
            </div>
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 48, textAlign: 'center' }}>
          <FolderOpen size={40} color="#4B5563" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>No projects found</h3>
          <p style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 16 }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
          </p>
          {!searchTerm && (
            <Button onClick={() => navigate('/projects/new')}>
              <Plus className="w-4 h-4" /> Create Project
            </Button>
          )}
        </div>
      )}
    </div>
  );
};