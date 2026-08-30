import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Plus, Calendar, Target, Play, Pause, CheckCircle2, X, GripVertical, Clock, AlertTriangle, TrendingDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { SprintBurndown } from '../components/SprintBurndown';

interface Sprint {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  goal: string | null;
  start_date: string;
  end_date: string;
  status: string;
  created_by: string | null;
  created_at: string;
  total_bugs: number;
  open_bugs: number;
  completed_bugs: number;
  critical_bugs: number;
  project_name: string;
}

interface Bug {
  id: string;
  title: string;
  status: string;
  priority: string;
  severity: string;
  assignee_name: string | null;
  sprint_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Project {
  id: string;
  name: string;
}

export const SprintPlanningPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [editingSprint, setEditingSprint] = useState<Sprint | null>(null);

  // New sprint form
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [sprintDescription, setSprintDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    if (!projectId) return;
    setLoading(true);

    // Fetch project
    const { data: projectData } = await supabase
      .from('projects')
      .select('id, name')
      .eq('id', projectId)
      .single();

    if (projectData) setProject(projectData);

    // Fetch sprints from the stats view
    const { data: sprintData } = await supabase
      .from('sprints_with_stats')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: false });

    if (sprintData) {
      setSprints(sprintData.map((s: any) => ({
        ...s,
        total_bugs: s.total_bugs || 0,
        open_bugs: s.open_bugs || 0,
        completed_bugs: s.completed_bugs || 0,
        critical_bugs: s.critical_bugs || 0,
        project_name: s.project_name || '',
      })));
    }

    // Fetch bugs
    const { data: bugData } = await supabase
      .from('bugs')
      .select('id, title, status, priority, severity, sprint_id, created_at, updated_at, profiles!bugs_assignee_id_fkey(name)')
      .eq('project_id', projectId)
      .eq('is_archived', false)
      .order('created_at', { ascending: false });

    if (bugData) {
      setBugs(bugData.map((b: any) => ({
        ...b,
        assignee_name: b.profiles?.name || null,
      })));
    }

    setLoading(false);
  };

  const handleCreateSprint = async () => {
    if (!sprintName.trim() || !startDate || !endDate || !projectId || !profile) return;
    setSubmitting(true);

    const { data: sprint, error } = await supabase
      .from('sprints')
      .insert({
        project_id: projectId,
        name: sprintName.trim(),
        description: sprintDescription.trim() || null,
        goal: sprintGoal.trim() || null,
        start_date: startDate,
        end_date: endDate,
        status: 'planning',
        created_by: profile.id,
      })
      .select()
      .single();

    if (!error && sprint) {
      setSprints(prev => [{ ...sprint, total_bugs: 0, open_bugs: 0, completed_bugs: 0, critical_bugs: 0, project_name: project?.name || '' }, ...prev]);
      setShowCreateModal(false);
      resetForm();
    }

    setSubmitting(false);
  };

  const handleUpdateSprint = async () => {
    if (!editingSprint || !sprintName.trim() || !startDate || !endDate) return;
    setSubmitting(true);

    const { error } = await supabase
      .from('sprints')
      .update({
        name: sprintName.trim(),
        description: sprintDescription.trim() || null,
        goal: sprintGoal.trim() || null,
        start_date: startDate,
        end_date: endDate,
      })
      .eq('id', editingSprint.id);

    if (!error) {
      setSprints(prev => prev.map(s =>
        s.id === editingSprint.id
          ? { ...s, name: sprintName.trim(), description: sprintDescription.trim() || null, goal: sprintGoal.trim() || null, start_date: startDate, end_date: endDate }
          : s
      ));
      setEditingSprint(null);
      resetForm();
    }

    setSubmitting(false);
  };

  const handleStatusChange = async (sprintId: string, newStatus: string) => {
    const { error } = await supabase
      .from('sprints')
      .update({ status: newStatus })
      .eq('id', sprintId);

    if (!error) {
      setSprints(prev => prev.map(s => s.id === sprintId ? { ...s, status: newStatus } : s));
    }
  };

  const handleAssignBug = async (bugId: string, sprintId: string | null) => {
    const { error } = await supabase
      .from('bugs')
      .update({ sprint_id: sprintId })
      .eq('id', bugId);

    if (!error) {
      setBugs(prev => prev.map(b => b.id === bugId ? { ...b, sprint_id: sprintId } : b));
      // Refresh sprint stats
      fetchData();
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Delete this sprint? Bugs will be unassigned but not deleted.')) return;

    // Unassign bugs from this sprint
    await supabase
      .from('bugs')
      .update({ sprint_id: null })
      .eq('sprint_id', sprintId);

    const { error } = await supabase
      .from('sprints')
      .delete()
      .eq('id', sprintId);

    if (!error) {
      setSprints(prev => prev.filter(s => s.id !== sprintId));
      setBugs(prev => prev.map(b => b.sprint_id === sprintId ? { ...b, sprint_id: null } : b));
      if (selectedSprint?.id === sprintId) setSelectedSprint(null);
    }
  };

  const resetForm = () => {
    setSprintName('');
    setSprintGoal('');
    setSprintDescription('');
    setStartDate('');
    setEndDate('');
  };

  const openEditModal = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setSprintName(sprint.name);
    setSprintGoal(sprint.goal || '');
    setSprintDescription(sprint.description || '');
    setStartDate(sprint.start_date.split('T')[0]);
    setEndDate(sprint.end_date.split('T')[0]);
  };

  const getSprintDates = (sprint: Sprint) => {
    const start = new Date(sprint.start_date);
    const end = new Date(sprint.end_date);
    return {
      start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      duration: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    };
  };

  const getSprintProgress = (sprint: Sprint) => {
    if (sprint.total_bugs === 0) return 0;
    return Math.round((sprint.completed_bugs / sprint.total_bugs) * 100);
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'planning': { background: 'rgba(251,146,60,0.15)', color: '#FB923C' },
      'active': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'completed': { background: 'rgba(120,133,162,0.15)', color: '#7c85a2' },
      'cancelled': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, ...(s[status] || s['planning']) };
  };

  const getPriorityStyle = (priority: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'medium': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'high': { background: 'rgba(240,152,88,0.15)', color: '#f09858' },
      'critical': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, ...(s[priority] || s['medium']) };
  };

  const unassignedBugs = useMemo(() => bugs.filter(b => !b.sprint_id), [bugs]);
  const activeSprint = sprints.find(s => s.status === 'active');
  const selectedSprintBugs = useMemo(() => {
    if (!selectedSprint) return [];
    return bugs.filter(b => b.sprint_id === selectedSprint.id);
  }, [bugs, selectedSprint]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(251,146,60,0.2)', borderTopColor: '#FB923C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading sprints...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <ArrowLeft style={{ width: 16, height: 16, color: '#9CA3AF' }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>Sprint Planning</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>{project?.name || 'Project'}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus style={{ width: 16, height: 16, marginRight: 6 }} />
          New Sprint
        </Button>
      </div>

      {/* Active Sprint Banner */}
      {activeSprint && (
        <div className="rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(61,214,140,0.08), rgba(251,146,60,0.08))', border: '1px solid rgba(61,214,140,0.2)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Play size={14} color="#3dd68c" />
              <span className="text-sm font-semibold" style={{ color: '#3dd68c' }}>Active Sprint</span>
              <span className="text-sm font-bold" style={{ color: '#F8FAFC' }}>{activeSprint.name}</span>
            </div>
            <span className="text-xs" style={{ color: '#484f6b' }}>
              {getSprintDates(activeSprint).start} — {getSprintDates(activeSprint).end}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs" style={{ color: '#7c85a2' }}>{activeSprint.completed_bugs}/{activeSprint.total_bugs} bugs completed</span>
                <span className="text-xs font-medium" style={{ color: '#3dd68c' }}>{getSprintProgress(activeSprint)}%</span>
              </div>
              <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${getSprintProgress(activeSprint)}%`, background: '#3dd68c' }} />
              </div>
            </div>
            {activeSprint.goal && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                <Target size={12} color="#FB923C" />
                <span className="text-xs" style={{ color: '#7c85a2' }}>{activeSprint.goal}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* Sprints List */}
        <div className="col-span-2 space-y-3">
          <h2 className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>Sprints ({sprints.length})</h2>

          {sprints.length === 0 ? (
            <div className="rounded-xl p-8 text-center" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Calendar size={32} color="#484f6b" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: '#7c85a2', fontSize: 14, marginBottom: 8 }}>No sprints yet</p>
              <p style={{ color: '#484f6b', fontSize: 12, marginBottom: 16 }}>Create your first sprint to start planning iterations</p>
              <Button onClick={() => setShowCreateModal(true)} size="sm">
                <Plus size={14} style={{ marginRight: 4 }} /> Create Sprint
              </Button>
            </div>
          ) : (
            sprints.map(sprint => {
              const dates = getSprintDates(sprint);
              const progress = getSprintProgress(sprint);
              const isSelected = selectedSprint?.id === sprint.id;

              return (
                <div
                  key={sprint.id}
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    background: isSelected ? 'rgba(251,146,60,0.06)' : '#1a1a2e',
                    border: `1px solid ${isSelected ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.06)'}`,
                  }}
                  onClick={() => setSelectedSprint(isSelected ? null : sprint)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={getStatusStyle(sprint.status)}>{sprint.status}</span>
                      <span className="text-sm font-semibold" style={{ color: '#F8FAFC' }}>{sprint.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: '#484f6b' }}>{dates.start} — {dates.end} ({dates.duration}d)</span>
                      {sprint.status === 'planning' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(sprint.id, 'active'); }}
                          className="p-1 rounded transition-colors"
                          style={{ color: '#3dd68c' }}
                          title="Start sprint"
                        >
                          <Play size={14} />
                        </button>
                      )}
                      {sprint.status === 'active' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleStatusChange(sprint.id, 'completed'); }}
                          className="p-1 rounded transition-colors"
                          style={{ color: '#7c85a2' }}
                          title="Complete sprint"
                        >
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  {sprint.goal && (
                    <p className="text-xs mb-2" style={{ color: '#7c85a2' }}>Goal: {sprint.goal}</p>
                  )}

                  {/* Progress bar */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: progress === 100 ? '#3dd68c' : '#FB923C' }} />
                      </div>
                    </div>
                    <span className="text-xs" style={{ color: '#484f6b' }}>
                      {sprint.completed_bugs}/{sprint.total_bugs} ({progress}%)
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs flex items-center gap-1" style={{ color: '#FB923C' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: '#FB923C' }} /> Open: {sprint.open_bugs}
                    </span>
                    <span className="text-xs flex items-center gap-1" style={{ color: '#3dd68c' }}>
                      <div className="w-2 h-2 rounded-full" style={{ background: '#3dd68c' }} /> Done: {sprint.completed_bugs}
                    </span>
                    {sprint.critical_bugs > 0 && (
                      <span className="text-xs flex items-center gap-1" style={{ color: '#f75f6b' }}>
                        <AlertTriangle size={10} /> Critical: {sprint.critical_bugs}
                      </span>
                    )}
                  </div>

                  {/* Burndown chart when selected */}
                  {isSelected && (
                    <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingDown size={14} color="#FB923C" />
                        <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>Sprint Burndown</span>
                      </div>
                      <SprintBurndown
                        bugs={selectedSprintBugs}
                        startDate={sprint.start_date}
                        endDate={sprint.end_date}
                        totalBugs={sprint.total_bugs}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Unassigned Bugs */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>Backlog ({unassignedBugs.length})</h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {unassignedBugs.length === 0 ? (
              <div className="rounded-lg p-4 text-center" style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs" style={{ color: '#484f6b' }}>All bugs assigned to sprints</p>
              </div>
            ) : (
              unassignedBugs.map(bug => (
                <div
                  key={bug.id}
                  className="rounded-lg p-3 cursor-pointer transition-colors"
                  style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}
                  onClick={() => navigate(`/dashboard/defects/${bug.id}`)}
                >
                  <p className="text-xs font-medium mb-1.5 line-clamp-2" style={{ color: '#d9dff0' }}>{bug.title}</p>
                  <div className="flex items-center gap-1.5">
                    <span style={getPriorityStyle(bug.priority)}>{bug.priority}</span>
                    {bug.assignee_name && (
                      <span className="text-xs" style={{ color: '#484f6b' }}>→ {bug.assignee_name}</span>
                    )}
                  </div>
                  {/* Quick assign to active sprint */}
                  {activeSprint && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleAssignBug(bug.id, activeSprint.id); }}
                      className="mt-2 text-xs px-2 py-1 rounded transition-colors"
                      style={{ background: 'rgba(61,214,140,0.1)', color: '#3dd68c', border: '1px solid rgba(61,214,140,0.2)' }}
                    >
                      + Add to {activeSprint.name}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create/Edit Sprint Modal */}
      {(showCreateModal || editingSprint) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-semibold" style={{ color: '#e8eaf0' }}>
                {editingSprint ? 'Edit Sprint' : 'Create Sprint'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setEditingSprint(null); resetForm(); }} style={{ color: '#7c85a2' }}>
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>Sprint Name *</label>
                <input
                  value={sprintName}
                  onChange={e => setSprintName(e.target.value)}
                  placeholder="e.g., Sprint 1, Week 1, v1.0"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>Goal</label>
                <input
                  value={sprintGoal}
                  onChange={e => setSprintGoal(e.target.value)}
                  placeholder="What should be achieved?"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>Description</label>
                <textarea
                  value={sprintDescription}
                  onChange={e => setSprintDescription(e.target.value)}
                  placeholder="Optional description..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                  />
                </div>
              </div>

              {startDate && endDate && (
                <p className="text-xs" style={{ color: '#484f6b' }}>
                  Duration: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => { setShowCreateModal(false); setEditingSprint(null); resetForm(); }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={editingSprint ? handleUpdateSprint : handleCreateSprint}
                disabled={!sprintName.trim() || !startDate || !endDate || submitting}
                className="flex-1"
              >
                {submitting ? 'Saving...' : editingSprint ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
