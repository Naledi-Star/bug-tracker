import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus, Bug, Users, Calendar, FolderOpen } from 'lucide-react';
import { mockProjects, mockDefects } from '../data/mockData';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const project = mockProjects.find(p => p.id === id);
  const projectDefects = mockDefects.filter(d => d.projectId === id);

  if (!project) {
    return (
      <div className="text-center py-16">
        <FolderOpen style={{ width: 48, height: 48, color: "#4B5563", margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>Project not found</h2>
        <Button onClick={() => navigate('/projects')}>
          <ArrowLeft style={{ width: 16, height: 16, marginRight: 6 }} />
          Back to Projects
        </Button>
      </div>
    );
  }

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'new': { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' },
      'assigned': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'in-progress': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'resolved': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'closed': { background: 'rgba(100,116,139,0.2)', color: '#9CA3AF' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6, ...(s[status] || s['new']) };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'medium': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'high': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'critical': { background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 6, ...(s[severity] || s['low']) };
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate('/projects')} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>{project.name}</h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>{project.description}</p>
          </div>
        </div>
        <Button onClick={() => navigate(`/projects/${id}/defects/new`)}>
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
            <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{project.createdAt.toLocaleDateString('en-GB')}</span>
          </div>
        </div>
        <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280", marginBottom: 4 }}>Team</p>
          <div className="flex items-center gap-1.5">
            <Users size={14} style={{ color: "#4B5563" }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{project.members.length} members</span>
          </div>
        </div>
      </div>

      {/* Team Members */}
      <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>Team Members</h2>
          <Button variant="outline" size="sm">
            <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
            Add
          </Button>
        </div>
        <div style={{ padding: 20 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {project.members.map((member) => (
              <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, border: "1px solid rgba(255,255,255,0.06)", transition: "all 0.15s ease" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: member.role === 'manager' ? '#6366F1' : member.role === 'developer' ? '#8B5CF6' : '#F59E0B',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 600, flexShrink: 0
                }}>
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.name}</p>
                  <p style={{ fontSize: 11, color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{member.email}</p>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, textTransform: 'capitalize',
                    background: member.role === 'manager' ? '#eff6ff' : member.role === 'developer' ? '#f5f3ff' : '#fffbeb',
                    color: member.role === 'manager' ? '#2563eb' : member.role === 'developer' ? '#7c3aed' : '#d97706'
                  }}>{member.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defects */}
      <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between p-5 pb-0">
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#F8FAFC" }}>Defects ({projectDefects.length})</h2>
          <Button onClick={() => navigate(`/projects/${id}/defects/new`)} size="sm">
            <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
            Report
          </Button>
        </div>
        <div style={{ padding: 20 }}>
          {projectDefects.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {projectDefects.map((defect) => (
                <div
                  key={defect.id}
                  onClick={() => navigate(`/defects/${defect.id}`)}
                  style={{ display: "flex", alignItems: "center", gap: 16, padding: 14, borderRadius: 10, border: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "all 0.15s ease" }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{defect.title}</h4>
                    <p style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>{defect.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                      <span>{defect.reporterName}</span>
                      <span>{defect.createdAt.toLocaleDateString('en-GB')}</span>
                      {defect.assigneeName && <span>Assigned to {defect.assigneeName}</span>}
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
                    <span style={getStatusStyle(defect.status)}>{defect.status.replace('-', ' ')}</span>
                    <span style={getSeverityStyle(defect.severity)}>{defect.severity}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <Bug style={{ width: 40, height: 40, color: "#4B5563", margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0", marginBottom: 4 }}>No defects reported</h3>
              <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 12 }}>This project has no defects yet.</p>
              <Button onClick={() => navigate(`/projects/${id}/defects/new`)} size="sm">
                <Plus style={{ width: 14, height: 14, marginRight: 4 }} />
                Report First Defect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};