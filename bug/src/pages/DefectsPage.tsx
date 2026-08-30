import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Search, Plus, X, Bug, CheckSquare, Square, Archive, ArrowRight, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import type { BugRow } from '../types';

interface BugWithProject extends BugRow {
  project_name?: string;
  reporter_name?: string;
  assignee_name?: string;
}

const statusOptions = ['open', 'in_progress', 'under_review', 'resolved', 'closed'];

export const DefectsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bugs, setBugs] = useState<BugWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedBugIds, setSelectedBugIds] = useState<Set<string>>(new Set());
  const [batchAction, setBatchAction] = useState<'status' | 'archive' | null>(null);
  const [batchStatus, setBatchStatus] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);

  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchBugs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('bugs')
        .select('*, projects(name), profiles!bugs_reporter_id_fkey(name), profiles!bugs_assignee_id_fkey(name)')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const bugsWithNames = data.map(b => ({
          ...b,
          project_name: (b.projects as any)?.name || '',
          reporter_name: (b.profiles as any)?.name || 'Unknown',
          assignee_name: null,
        }));
        setBugs(bugsWithNames);
      }
      setLoading(false);
    };

    fetchBugs();

    const channel = supabase
      .channel('defects-list')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bugs',
      }, (payload) => {
        const eventType = payload.eventType;
        const record = payload.new as any;

        if (eventType === 'INSERT' && !record.is_archived) {
          setBugs(prev => [{
            ...record,
            project_name: '',
            reporter_name: 'Unknown',
            assignee_name: null,
          }, ...prev]);
        } else if (eventType === 'UPDATE') {
          setBugs(prev => prev.map(b =>
            b.id === record.id
              ? { ...b, ...record, project_name: b.project_name, reporter_name: b.reporter_name, assignee_name: b.assignee_name }
              : b
          ));
        } else if (eventType === 'DELETE') {
          setBugs(prev => prev.filter(b => b.id !== (payload.old as any).id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.company_id]);

  const filteredBugs = useMemo(() => {
    return bugs.filter(bug => {
      const matchesSearch = bug.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bug.description && bug.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bug.project_name && bug.project_name.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || bug.status === statusFilter;
      const matchesSeverity = severityFilter === 'all' || bug.severity === severityFilter;
      const matchesPriority = priorityFilter === 'all' || bug.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesSeverity && matchesPriority;
    });
  }, [bugs, searchTerm, statusFilter, severityFilter, priorityFilter]);

  const toggleSelectAll = () => {
    if (selectedBugIds.size === filteredBugs.length) {
      setSelectedBugIds(new Set());
    } else {
      setSelectedBugIds(new Set(filteredBugs.map(b => b.id)));
    }
  };

  const toggleSelectBug = (bugId: string) => {
    setSelectedBugIds(prev => {
      const next = new Set(prev);
      if (next.has(bugId)) {
        next.delete(bugId);
      } else {
        next.add(bugId);
      }
      return next;
    });
  };

  const handleBatchStatusChange = async () => {
    if (selectedBugIds.size === 0 || !batchStatus) return;
    setBatchLoading(true);

    const ids = Array.from(selectedBugIds);
    const { error } = await supabase
      .from('bugs')
      .update({ status: batchStatus, updated_at: new Date().toISOString() })
      .in('id', ids);

    if (!error) {
      setBugs(prev => prev.map(b => ids.includes(b.id) ? { ...b, status: batchStatus } : b));
      setSelectedBugIds(new Set());
      setBatchAction(null);
      setBatchStatus('');
    }

    setBatchLoading(false);
  };

  const handleBatchArchive = async () => {
    if (selectedBugIds.size === 0) return;
    if (!confirm(`Archive ${selectedBugIds.size} bugs? They will be hidden from the main list.`)) return;
    setBatchLoading(true);

    const ids = Array.from(selectedBugIds);
    const { error } = await supabase
      .from('bugs')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .in('id', ids);

    if (!error) {
      setBugs(prev => prev.filter(b => !ids.includes(b.id)));
      setSelectedBugIds(new Set());
    }

    setBatchLoading(false);
  };

  const handleBatchDelete = async () => {
    if (selectedBugIds.size === 0) return;
    if (!confirm(`Permanently delete ${selectedBugIds.size} bugs? This cannot be undone.`)) return;
    setBatchLoading(true);

    const ids = Array.from(selectedBugIds);
    const { error } = await supabase
      .from('bugs')
      .delete()
      .in('id', ids);

    if (!error) {
      setBugs(prev => prev.filter(b => !ids.includes(b.id)));
      setSelectedBugIds(new Set());
    }

    setBatchLoading(false);
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'open': { background: 'rgba(251,146,60,0.15)', color: '#FB923C' },
      'in_progress': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'under_review': { background: 'rgba(155,124,244,0.15)', color: '#9b7cf4' },
      'resolved': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'closed': { background: 'rgba(72,79,107,0.2)', color: '#7c85a2' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap' as const, ...(s[status] || s['open']) };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'medium': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'high': { background: 'rgba(240,152,88,0.15)', color: '#f09858' },
      'blocker': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, ...s[severity] };
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'medium': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'high': { background: 'rgba(240,152,88,0.15)', color: '#f09858' },
      'critical': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 6, ...s[priority] };
  };

  const hasFilters = searchTerm || statusFilter !== 'all' || severityFilter !== 'all' || priorityFilter !== 'all';
  const hasSelection = selectedBugIds.size > 0;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(251,146,60,0.2)', borderTopColor: '#FB923C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading bugs...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Defects</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>Track and manage all reported defects across projects</p>
        </div>
        <Button onClick={() => navigate('/dashboard/defects/new')}>
          <Plus className="w-4 h-4" /> Report Defect
        </Button>
      </div>

      {/* Batch Actions Toolbar */}
      {hasSelection && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}>
          <div className="flex items-center gap-2">
            <CheckSquare size={16} color="#FB923C" />
            <span className="text-sm font-medium" style={{ color: '#FB923C' }}>{selectedBugIds.size} selected</span>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {/* Batch Status Change */}
            <div className="flex items-center gap-1">
              <select
                value={batchStatus}
                onChange={e => setBatchStatus(e.target.value)}
                className="px-2 py-1 rounded text-xs outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#d9dff0' }}
              >
                <option value="">Change status...</option>
                {statusOptions.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
              <button
                onClick={handleBatchStatusChange}
                disabled={!batchStatus || batchLoading}
                className="px-2 py-1 rounded text-xs font-medium transition-colors"
                style={{
                  background: batchStatus && !batchLoading ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)',
                  color: batchStatus && !batchLoading ? '#FB923C' : '#484f6b',
                }}
              >
                Apply
              </button>
            </div>

            {/* Batch Archive */}
            <button
              onClick={handleBatchArchive}
              disabled={batchLoading}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{ background: 'rgba(240,152,88,0.1)', color: '#f09858' }}
            >
              <Archive size={12} /> Archive
            </button>

            {/* Batch Delete */}
            <button
              onClick={handleBatchDelete}
              disabled={batchLoading}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors"
              style={{ background: 'rgba(247,95,107,0.1)', color: '#f75f6b' }}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          <button
            onClick={() => setSelectedBugIds(new Set())}
            className="ml-auto p-1 rounded transition-colors"
            style={{ color: '#484f6b' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters */}
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
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#F8FAFC', outline: 'none' }}>
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="under_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#F8FAFC', outline: 'none' }}>
            <option value="all">All Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="blocker">Blocker</option>
          </select>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
            style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#F8FAFC', outline: 'none' }}>
            <option value="all">All Priority</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          {hasFilters && (
            <button
              onClick={() => { setSearchTerm(''); setStatusFilter('all'); setSeverityFilter('all'); setPriorityFilter('all'); }}
              style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', background: 'rgba(247,95,107,0.1)', border: '1px solid rgba(247,95,107,0.2)', borderRadius: 8, fontSize: 12, color: '#f75f6b', cursor: 'pointer' }}
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Bugs Table */}
      <div style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {/* Table Header */}
        <div className="grid items-center" style={{ gridTemplateColumns: '40px 1fr 120px 100px 100px 100px 100px', padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
          <button onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#484f6b', padding: 0 }}>
            {selectedBugIds.size === filteredBugs.length && filteredBugs.length > 0 ? (
              <CheckSquare size={16} color="#FB923C" />
            ) : (
              <Square size={16} />
            )}
          </button>
          <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Bug</span>
          <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Project</span>
          <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Status</span>
          <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Priority</span>
          <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Severity</span>
          <span className="text-xs font-semibold" style={{ color: '#484f6b' }}>Reporter</span>
        </div>

        {/* Table Body */}
        {filteredBugs.length === 0 ? (
          <div className="py-16 text-center" style={{ color: '#484f6b' }}>
            <Bug size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p className="text-sm">No bugs found</p>
          </div>
        ) : (
          filteredBugs.map((bug, i) => (
            <div
              key={bug.id}
              className="grid items-center cursor-pointer transition-colors"
              style={{
                gridTemplateColumns: '40px 1fr 120px 100px 100px 100px 100px',
                padding: '12px 16px',
                borderBottom: i < filteredBugs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                background: selectedBugIds.has(bug.id) ? 'rgba(251,146,60,0.06)' : 'transparent',
              }}
              onMouseEnter={e => { if (!selectedBugIds.has(bug.id)) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!selectedBugIds.has(bug.id)) e.currentTarget.style.background = 'transparent'; }}
            >
              <button
                onClick={(e) => { e.stopPropagation(); toggleSelectBug(bug.id); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#484f6b', padding: 0 }}
              >
                {selectedBugIds.has(bug.id) ? (
                  <CheckSquare size={16} color="#FB923C" />
                ) : (
                  <Square size={16} />
                )}
              </button>
              <div
                className="min-w-0 pr-4"
                onClick={() => navigate(`/dashboard/defects/${bug.id}`)}
              >
                <p className="text-xs font-medium truncate" style={{ color: '#d9dff0' }}>{bug.title}</p>
              </div>
              <span className="text-xs truncate" style={{ color: '#7c85a2' }}>{bug.project_name}</span>
              <span style={getStatusStyle(bug.status)} className="text-center">{bug.status.replace('_', ' ')}</span>
              <span style={getPriorityStyle(bug.priority)} className="text-center">{bug.priority}</span>
              <span style={getSeverityStyle(bug.severity)} className="text-center">{bug.severity}</span>
              <span className="text-xs text-center" style={{ color: '#7c85a2' }}>{bug.reporter_name}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
