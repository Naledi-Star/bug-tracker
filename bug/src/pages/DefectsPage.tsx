import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, Plus, X, Bug } from 'lucide-react';
import { mockDefects } from '../data/mockData';

export const DefectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');

  const filteredDefects = mockDefects.filter(defect => {
    const matchesSearch = defect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      defect.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;
    return matchesSearch && matchesStatus && matchesSeverity;
  });

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'new': { background: 'rgba(99,102,241,0.15)', color: '#A5B4FC' },
      'assigned': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'in-progress': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'in-review': { background: 'rgba(168,85,247,0.15)', color: '#D8B4FE' },
      'resolved': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'closed': { background: 'rgba(100,116,139,0.2)', color: '#9CA3AF' },
      'needs-info': { background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap' as const, ...s[status] };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'medium': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'high': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'critical': { background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, ...s[severity] };
  };

  const hasFilters = searchTerm || statusFilter !== 'all' || severityFilter !== 'all';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Defects</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Track and manage all reported defects across projects</p>
        </div>
        <Button onClick={() => navigate('/defects/new')}>
          <Plus className="w-4 h-4" /> Report Defect
        </Button>
      </div>

      <div style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4B5563', width: 16, height: 16 }} />
            <input
              type="text"
              placeholder="Search defects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '8px 12px 8px 34px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#F8FAFC', outline: 'none' }}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="assigned">Assigned</option>
            <option value="in-progress">In Progress</option>
            <option value="in-review">In Review</option>
            <option value="needs-info">Needs Info</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#F8FAFC', outline: 'none' }}
          >
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSeverityFilter('all'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', fontSize: 13, color: '#9CA3AF', background: 'transparent', border: 'none', borderRadius: 8, cursor: 'pointer' }}
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ padding: '20px 24px 0' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#F8FAFC' }}>All Defects ({filteredDefects.length})</h2>
        </div>
        <div style={{ padding: 20 }}>
          {filteredDefects.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    {['Title', 'Project', 'Status', 'Severity', 'Assignee', 'Reporter', 'Created'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 11, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDefects.map((defect) => (
                    <tr
                      key={defect.id}
                      onClick={() => navigate(`/defects/${defect.id}`)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', cursor: 'pointer' }}
                    >
                      <td style={{ padding: '12px' }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{defect.title}</p>
                        <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{defect.description}</p>
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: 13, color: '#818CF8', fontWeight: 600 }}>{defect.projectName}</span>
                      </td>
                      <td style={{ padding: '12px' }}><span style={getStatusStyle(defect.status)}>{defect.status.replace('-', ' ')}</span></td>
                      <td style={{ padding: '12px' }}><span style={getSeverityStyle(defect.severity)}>{defect.severity}</span></td>
                      <td style={{ padding: '12px' }}>
                        {defect.assigneeName ? (
                          <span style={{ fontSize: 13, color: '#CBD5E1' }}>{defect.assigneeName}</span>
                        ) : (
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: '#6B7280', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 4 }}>Unassigned</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ fontSize: 13, color: '#CBD5E1' }}>{defect.reporterName}</span>
                      </td>
                      <td style={{ padding: '12px', fontSize: 13, color: '#6B7280' }}>
                        {defect.createdAt.toLocaleDateString('en-GB')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 48 }}>
              <Bug size={36} color="#4B5563" style={{ margin: '0 auto 12px' }} />
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0', marginBottom: 4 }}>No defects found</h3>
              <p style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 16 }}>
                {hasFilters ? 'Try adjusting your search or filter criteria' : 'No defects have been reported yet'}
              </p>
              <Button onClick={() => navigate('/defects/new')} size="sm">
                <Plus className="w-3.5 h-3.5" /> Report Defect
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};