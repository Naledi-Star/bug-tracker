import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Send, Play, Eye, CheckCircle2, AlertCircle, UserPlus, MessageSquare, Paperclip, FileText, Image, Film, Code, File, Download } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { FileUpload } from '../components/FileUpload';
import type { UploadedFile } from '../lib/upload';
import { formatFileSize, getFileIconType } from '../lib/upload';
import { exportBugReportPDF } from '../lib/pdfExport';
import { notifyBugAssigned, notifyStatusChanged, notifyCommentAdded } from '../lib/notifications';

interface BugData {
  id: string;
  title: string;
  description: string | null;
  steps_to_reproduce: string | null;
  expected_behavior: string | null;
  actual_behavior: string | null;
  status: string;
  priority: string;
  severity: string;
  reporter_id: string | null;
  assignee_id: string | null;
  project_id: string | null;
  due_date: string | null;
  environment: any;
  labels: string[];
  attachments: any[];
  created_at: string;
  updated_at: string;
  project_name?: string;
  reporter_name?: string;
  assignee_name?: string;
}

interface BugComment {
  id: string;
  author_id: string;
  content: string;
  type: string;
  created_at: string;
  author_name?: string;
  author_role?: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const fileIconMap: Record<string, any> = { image: Image, video: Film, document: FileText, code: Code, other: File };
const fileIconColor: Record<string, string> = { image: '#FB923C', video: '#9b7cf4', document: '#3dd68c', code: '#e5a435', other: '#7c85a2' };

export const DefectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [bug, setBug] = useState<BugData | null>(null);
  const [comments, setComments] = useState<BugComment[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [newComment, setNewComment] = useState('');
  const [currentStatus, setCurrentStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  // Track own actions to avoid duplicate updates from real-time
  const lastOwnUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!id) return;
    const fetchBug = async () => {
      setLoading(true);
      // Fetch bug with simple query first (avoid complex join that can fail silently)
      const { data: bugData, error: bugError } = await supabase
        .from('bugs')
        .select('*')
        .eq('id', id)
        .single();

      if (bugError || !bugData) {
        console.error('Bug fetch error:', bugError);
        setLoading(false);
        return;
      }

      // Fetch related data separately for reliability
      let projectName = '';
      let reporterName = 'Unknown';
      let assigneeName: string | null = null;

      if (bugData.project_id) {
        const { data: proj } = await supabase.from('projects').select('name').eq('id', bugData.project_id).single();
        projectName = proj?.name || '';
      }
      if (bugData.reporter_id) {
        const { data: reporter } = await supabase.from('profiles').select('name').eq('id', bugData.reporter_id).single();
        reporterName = reporter?.name || 'Unknown';
      }
      if (bugData.assignee_id) {
        const { data: assignee } = await supabase.from('profiles').select('name').eq('id', bugData.assignee_id).single();
        assigneeName = assignee?.name || null;
      }

      if (bugData) {
        const bugWithNames: BugData = {
          ...bugData,
          project_name: projectName,
          reporter_name: reporterName,
          assignee_name: assigneeName,
          attachments: bugData.attachments || [],
        };
        setBug(bugWithNames);
        setCurrentStatus(bugData.status);
        if (bugData.assignee_id) setSelectedAssignee(bugData.assignee_id);
      }

      const { data: commentData } = await supabase
        .from('bug_comments')
        .select('*, profiles(name, role)')
        .eq('bug_id', id)
        .order('created_at', { ascending: true });

      if (commentData) {
        setComments(commentData.map((c: any) => ({
          ...c,
          author_name: c.profiles?.name || 'Unknown',
          author_role: c.profiles?.role || 'developer',
        })));
      }
      setLoading(false);
    };
    fetchBug();

    // Subscribe to real-time bug updates
    const bugChannel = supabase
      .channel(`bug-detail-${id}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bugs',
        filter: `id=eq.${id}`,
      }, (payload) => {
        // Skip if we just made this update ourselves
        if (Date.now() - lastOwnUpdateRef.current < 2000) return;

        const updated = payload.new as any;
        setBug(prev => prev ? {
          ...prev,
          title: updated.title,
          description: updated.description,
          status: updated.status,
          priority: updated.priority,
          severity: updated.severity,
          assignee_id: updated.assignee_id,
          due_date: updated.due_date,
          labels: updated.labels || [],
          attachments: updated.attachments || [],
          updated_at: updated.updated_at,
        } : prev);
        setCurrentStatus(updated.status);
      })
      .subscribe();

    // Subscribe to real-time new comments
    const commentChannel = supabase
      .channel(`bug-comments-${id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bug_comments',
        filter: `bug_id=eq.${id}`,
      }, async (payload) => {
        const newComment = payload.new as any;
        // Fetch the author profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', newComment.author_id)
          .single();

        setComments(prev => [...prev, {
          id: newComment.id,
          author_id: newComment.author_id,
          content: newComment.content,
          type: newComment.type,
          created_at: newComment.created_at,
          author_name: profileData?.name || 'Unknown',
          author_role: profileData?.role || 'developer',
        }]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bugChannel);
      supabase.removeChannel(commentChannel);
    };
  }, [id]);

  useEffect(() => {
    if (!profile?.company_id) return;
    const fetchMembers = async () => {
      const { data } = await supabase.from('profiles').select('id, name, email, avatar, role').eq('company_id', profile.company_id);
      if (data) setTeamMembers(data);
    };
    fetchMembers();
  }, [profile?.company_id]);

  const refreshComments = async () => {
    if (!id) return;
    const { data: commentData } = await supabase
      .from('bug_comments')
      .select('*, profiles(name, role)')
      .eq('bug_id', id)
      .order('created_at', { ascending: true });
    if (commentData) {
      setComments(commentData.map((c: any) => ({
        ...c,
        author_name: c.profiles?.name || 'Unknown',
        author_role: c.profiles?.role || 'developer',
      })));
    }
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'open': { background: 'rgba(251,146,60,0.15)', color: '#FB923C' },
      'in_progress': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'under_review': { background: 'rgba(155,124,244,0.15)', color: '#9b7cf4' },
      'resolved': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'closed': { background: 'rgba(72,79,107,0.2)', color: '#7c85a2' },
    };
    return { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, ...(s[status] || s['open']) };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(61,214,140,0.15)', color: '#3dd68c' },
      'medium': { background: 'rgba(229,164,53,0.15)', color: '#e5a435' },
      'high': { background: 'rgba(240,152,88,0.15)', color: '#f09858' },
      'blocker': { background: 'rgba(247,95,107,0.15)', color: '#f75f6b' },
    };
    return { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, ...(s[severity] || s['low']) };
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!bug || !profile) return;
    lastOwnUpdateRef.current = Date.now();
    setSubmitting(true);
    const oldStatus = bug.status;
    const { error } = await supabase.from('bugs').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', bug.id);
    if (!error) {
      setCurrentStatus(newStatus);
      setBug(prev => prev ? { ...prev, status: newStatus } : prev);
      await supabase.from('bug_comments').insert({ bug_id: bug.id, author_id: profile.id, content: `Status changed to ${newStatus.replace('_', ' ')}`, type: 'status-change' });
      await refreshComments();

      // Send notifications
      notifyStatusChanged({
        bugId: bug.id,
        bugTitle: bug.title,
        oldStatus,
        newStatus,
        assigneeId: bug.assignee_id || undefined,
        reporterId: bug.reporter_id || undefined,
        actorName: profile.name || 'Unknown',
        actorEmail: profile.email || '',
        projectName: bug.project_name,
      });
    }
    setSubmitting(false);
  };

  const handleAssign = async () => {
    if (!bug || !selectedAssignee || !profile) return;
    lastOwnUpdateRef.current = Date.now();
    setSubmitting(true);
    const { error } = await supabase.from('bugs').update({ assignee_id: selectedAssignee, updated_at: new Date().toISOString() }).eq('id', bug.id);
    if (!error) {
      const assignee = teamMembers.find(m => m.id === selectedAssignee);
      if (assignee) {
        setBug(prev => prev ? { ...prev, assignee_id: selectedAssignee, assignee_name: assignee.name } : prev);
        await supabase.from('bug_comments').insert({ bug_id: bug.id, author_id: profile.id, content: `Assigned to ${assignee.name}`, type: 'assignment' });
        await refreshComments();

        // Send notifications
        notifyBugAssigned({
          bugId: bug.id,
          bugTitle: bug.title,
          assigneeId: assignee.id,
          assigneeName: assignee.name,
          assigneeEmail: (assignee as any).email || '',
          actorName: profile.name || 'Unknown',
          actorEmail: profile.email || '',
          projectName: bug.project_name,
        });
      }
    }
    setSubmitting(false);
  };

  const handleAddComment = async () => {
    if (!bug || !newComment.trim() || !profile) return;
    lastOwnUpdateRef.current = Date.now();
    setSubmitting(true);
    const { error } = await supabase.from('bug_comments').insert({ bug_id: bug.id, author_id: profile.id, content: newComment.trim(), type: 'comment' });
    if (!error) {
      setNewComment('');
      await refreshComments();

      // Send notifications
      notifyCommentAdded({
        bugId: bug.id,
        bugTitle: bug.title,
        assigneeId: bug.assignee_id || undefined,
        reporterId: bug.reporter_id || undefined,
        actorName: profile.name || 'Unknown',
        actorEmail: profile.email || '',
        commentPreview: newComment.trim().substring(0, 100),
        projectName: bug.project_name,
      });
    }
    setSubmitting(false);
  };

  const handleAttachmentsUploaded = async (files: UploadedFile[]) => {
    if (!bug) return;
    lastOwnUpdateRef.current = Date.now();
    const updatedAttachments = files.map(f => ({ name: f.name, url: f.url, size: f.size, type: f.type, path: f.path }));
    await supabase.from('bugs').update({ attachments: updatedAttachments, updated_at: new Date().toISOString() }).eq('id', bug.id);
    setBug(prev => prev ? { ...prev, attachments: updatedAttachments } : prev);
  };

  const statusFlow = [
    { status: 'open', label: 'Start Work', icon: Play, next: 'in_progress' },
    { status: 'in_progress', label: 'Submit for Review', icon: Eye, next: 'under_review' },
    { status: 'under_review', label: 'Mark Resolved', icon: CheckCircle2, next: 'resolved' },
    { status: 'resolved', label: 'Close Bug', icon: AlertCircle, next: 'closed' },
  ];

  const nextAction = statusFlow.find(s => s.status === currentStatus);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 32, height: 32, border: '3px solid rgba(251,146,60,0.2)', borderTopColor: '#FB923C', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <p style={{ color: '#7c85a2', fontSize: 13 }}>Loading bug...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="text-center py-16">
        <AlertCircle style={{ width: 48, height: 48, color: "#4B5563", margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>Bug not found</h2>
        <Button onClick={() => navigate('/dashboard/defects')}><ArrowLeft style={{ width: 16, height: 16, marginRight: 6 }} />Back to Bugs</Button>
      </div>
    );
  }

  const handleExportPDF = () => {
    exportBugReportPDF({
      id: bug.id,
      title: bug.title,
      description: bug.description,
      status: bug.status,
      priority: bug.priority,
      severity: bug.severity,
      reporter_name: bug.reporter_name || 'Unknown',
      assignee_name: bug.assignee_name,
      project_name: bug.project_name || '',
      due_date: bug.due_date,
      created_at: bug.created_at,
      updated_at: bug.updated_at,
      steps_to_reproduce: bug.steps_to_reproduce,
      expected_behavior: bug.expected_behavior,
      actual_behavior: bug.actual_behavior,
      labels: bug.labels || [],
      attachments: bug.attachments || [],
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between' }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>{bug.title}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span style={getStatusStyle(bug.status)}>{bug.status.replace('_', ' ')}</span>
              <span style={getSeverityStyle(bug.severity)}>{bug.severity}</span>
              <span className="text-xs" style={{ color: '#484f6b' }}>{bug.project_name}</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleExportPDF}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          style={{ background: 'rgba(251,146,60,0.12)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.3)' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(251,146,60,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(251,146,60,0.12)')}
        >
          <Download size={13} /> Export PDF
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="col-span-2 space-y-4">
          {/* Description */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>Description</h3>
            <p className="text-sm whitespace-pre-wrap" style={{ color: '#A0A8C0' }}>{bug.description || 'No description provided.'}</p>
          </div>

          {/* Steps to Reproduce */}
          {bug.steps_to_reproduce && (
            <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>Steps to Reproduce</h3>
              <pre className="text-sm whitespace-pre-wrap" style={{ color: '#A0A8C0', fontFamily: 'monospace', fontSize: 12 }}>{bug.steps_to_reproduce}</pre>
            </div>
          )}

          {/* Expected vs Actual */}
          {(bug.expected_behavior || bug.actual_behavior) && (
            <div className="grid grid-cols-2 gap-4">
              {bug.expected_behavior && (
                <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#3dd68c' }}>Expected</h3>
                  <p className="text-sm" style={{ color: '#A0A8C0' }}>{bug.expected_behavior}</p>
                </div>
              )}
              {bug.actual_behavior && (
                <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: '#f75f6b' }}>Actual</h3>
                  <p className="text-sm" style={{ color: '#A0A8C0' }}>{bug.actual_behavior}</p>
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#F8FAFC' }}>
                <Paperclip size={14} /> Attachments ({bug.attachments?.length || 0})
              </h3>
              <button onClick={() => setShowAttachments(!showAttachments)} className="text-xs" style={{ color: '#FB923C', background: 'none', border: 'none', cursor: 'pointer' }}>
                {showAttachments ? 'Hide' : 'Add files'}
              </button>
            </div>

            {bug.attachments && bug.attachments.length > 0 && (
              <div className="space-y-2 mb-3">
                {bug.attachments.map((file: any, i: number) => {
                  const fileType = getFileIconType(file.type || '');
                  const Icon = fileIconMap[fileType] || File;
                  const color = fileIconColor[fileType] || '#7c85a2';
                  return (
                    <a key={i} href={file.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
                      style={{ background: 'rgba(255,255,255,0.03)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.06)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                        <Icon size={14} color={color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: '#d9dff0' }}>{file.name}</p>
                        <p className="text-xs" style={{ color: '#484f6b' }}>{formatFileSize(file.size || 0)}</p>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}

            {showAttachments && (
              <FileUpload
                onFilesUploaded={handleAttachmentsUploaded}
                existingFiles={bug.attachments?.map((f: any) => ({
                  url: f.url, name: f.name, size: f.size || 0, type: f.type || '', path: f.path || '',
                })) || []}
                folder={`bugs/${bug.project_id || 'general'}`}
                maxFiles={10}
                maxSizeMB={25}
              />
            )}
          </div>

          {/* Labels */}
          {bug.labels && bug.labels.length > 0 && (
            <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>Labels</h3>
              <div className="flex flex-wrap gap-2">
                {bug.labels.map((label, i) => (
                  <span key={i} className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(251,146,60,0.15)', color: '#FB923C' }}>{label}</span>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: '#F8FAFC' }}>
              <MessageSquare size={14} /> Comments ({comments.length})
            </h3>
            <div className="space-y-3 mb-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: 'rgba(251,146,60,0.15)', color: '#FB923C' }}>
                    {comment.author_name?.[0] || '?'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold" style={{ color: '#d9dff0' }}>{comment.author_name}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: '#484f6b' }}>{comment.author_role}</span>
                      <span className="text-xs" style={{ color: '#2e3450' }}>{new Date(comment.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-sm" style={{ color: '#A0A8C0' }}>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..."
                rows={2} className="flex-1 px-3 py-2 rounded-lg text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: '#F8FAFC' }} />
              <Button onClick={handleAddComment} disabled={!newComment.trim() || submitting} size="sm"><Send size={14} /></Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>Quick Actions</h3>
            <div className="space-y-2">
              {nextAction && (
                <button onClick={() => handleStatusChange(nextAction.next)} disabled={submitting}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(251,146,60,0.15)', color: '#FB923C', border: '1px solid rgba(251,146,60,0.3)' }}>
                  <nextAction.icon size={14} /> {nextAction.label}
                </button>
              )}
              {currentStatus !== 'open' && (
                <button onClick={() => handleStatusChange('open')} disabled={submitting}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                  style={{ background: 'rgba(247,95,107,0.1)', color: '#f75f6b', border: '1px solid rgba(247,95,107,0.2)' }}>
                  Reopen Bug
                </button>
              )}
            </div>
          </div>

          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: '#F8FAFC' }}>
              <UserPlus size={14} /> Assignment
            </h3>
            <select value={selectedAssignee} onChange={e => setSelectedAssignee(e.target.value)}
              style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 12, color: "#F8FAFC", outline: "none", marginBottom: 8 }}>
              <option value="">Unassigned</option>
              {teamMembers.map(m => (<option key={m.id} value={m.id}>{m.name} ({m.role})</option>))}
            </select>
            <Button onClick={handleAssign} disabled={!selectedAssignee || submitting} size="sm" className="w-full">Assign</Button>
          </div>

          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#F8FAFC' }}>Details</h3>
            <div className="space-y-3">
              <div><span className="text-xs block mb-1" style={{ color: '#484f6b' }}>Reporter</span><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{bug.reporter_name}</span></div>
              <div><span className="text-xs block mb-1" style={{ color: '#484f6b' }}>Assignee</span><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{bug.assignee_name || 'Unassigned'}</span></div>
              <div><span className="text-xs block mb-1" style={{ color: '#484f6b' }}>Priority</span><span className="text-xs font-medium capitalize" style={{ color: '#d9dff0' }}>{bug.priority}</span></div>
              <div><span className="text-xs block mb-1" style={{ color: '#484f6b' }}>Due Date</span><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{bug.due_date ? new Date(bug.due_date).toLocaleDateString() : 'None'}</span></div>
              <div><span className="text-xs block mb-1" style={{ color: '#484f6b' }}>Created</span><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{new Date(bug.created_at).toLocaleDateString()}</span></div>
              <div><span className="text-xs block mb-1" style={{ color: '#484f6b' }}>Updated</span><span className="text-xs font-medium" style={{ color: '#d9dff0' }}>{new Date(bug.updated_at).toLocaleDateString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
