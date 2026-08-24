import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mail, Phone, Send, Paperclip, Play, Eye, CheckCircle2, AlertCircle, UserPlus, MessageSquare } from 'lucide-react';
import { mockDefects, mockUsers } from '../data/mockData';
import { Comment } from '../types';

export const DefectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const defect = mockDefects.find(d => d.id === id);
  const [selectedAssignee, setSelectedAssignee] = useState(defect?.assigneeId || '');
  const [comments, setComments] = useState<Comment[]>(defect?.comments || []);
  const [newComment, setNewComment] = useState('');
  const [currentStatus, setCurrentStatus] = useState(defect?.status || 'new');

  if (!defect) {
    return (
      <div className="text-center py-16">
        <AlertCircle style={{ width: 48, height: 48, color: "#4B5563", margin: "0 auto 12px" }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>Defect not found</h2>
        <Button onClick={() => navigate('/defects')}>
          <ArrowLeft style={{ width: 16, height: 16, marginRight: 6 }} />
          Back to Defects
        </Button>
      </div>
    );
  }

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
    return { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, ...(s[status] || s['new']) };
  };

  const getSeverityStyle = (severity: string): React.CSSProperties => {
    const s: Record<string, React.CSSProperties> = {
      'low': { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      'medium': { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      'high': { background: 'rgba(249,115,22,0.15)', color: '#FDBA74' },
      'critical': { background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' },
    };
    return { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, ...(s[severity] || s['low']) };
  };

  const handleAssign = () => {
    if (selectedAssignee) {
      const assignee = mockUsers.find(u => u.id === selectedAssignee);
      if (assignee) {
        const comment: Comment = {
          id: `c${Date.now()}`,
          defectId: defect.id,
          userId: assignee.id,
          userName: 'N. Galeragwe',
          userRole: 'manager',
          content: `Assigned to ${assignee.name}`,
          createdAt: new Date(),
          type: 'assignment',
        };
        setComments(prev => [...prev, comment]);
        alert(`Defect assigned to ${assignee.name}`);
      }
    }
  };

  const handleStatusChange = (newStatus: string) => {
    setCurrentStatus(newStatus as any);
    const comment: Comment = {
      id: `c${Date.now()}`,
      defectId: defect.id,
      userId: '1',
      userName: 'N. Galeragwe',
      userRole: 'manager',
      content: `Status changed to ${newStatus.replace('-', ' ')}`,
      createdAt: new Date(),
      type: 'status-change',
    };
    setComments(prev => [...prev, comment]);
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c${Date.now()}`,
      defectId: defect.id,
      userId: '1',
      userName: 'N. Galeragwe',
      userRole: 'manager',
      content: newComment,
      createdAt: new Date(),
      type: 'comment',
    };
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate('/defects')} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
          </button>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>{defect.title}</h1>
            <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Defect #{defect.id} &middot; {defect.projectName}</p>
          </div>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <span style={getStatusStyle(currentStatus)}>{currentStatus.replace('-', ' ')}</span>
        <span style={getSeverityStyle(defect.severity)}>{defect.severity}</span>
        <span style={{ fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 8, background: '#f1f5f9', color: '#475569' }}>
          Created {defect.createdAt.toLocaleDateString('en-GB')}
        </span>
      </div>

      {/* Status action buttons */}
      <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 16 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Quick Actions</p>
        <div className="flex flex-wrap gap-2">
          {currentStatus !== 'in-progress' && currentStatus !== 'resolved' && currentStatus !== 'closed' && (
            <Button size="sm" onClick={() => handleStatusChange('in-progress')}>
              <Play size={14} style={{ marginRight: 6 }} /> Start Work
            </Button>
          )}
          {currentStatus === 'in-progress' && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange('in-review')}>
              <Eye size={14} style={{ marginRight: 6 }} /> Submit for Review
            </Button>
          )}
          {currentStatus === 'in-review' && (
            <Button size="sm" onClick={() => handleStatusChange('resolved')}>
              <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Mark Resolved
            </Button>
          )}
          {currentStatus === 'resolved' && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange('closed')}>
              <CheckCircle2 size={14} style={{ marginRight: 6 }} /> Close Defect
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => handleStatusChange('needs-info')}>
            <AlertCircle size={14} style={{ marginRight: 6 }} /> Request Info
          </Button>
          <Button size="sm" variant="outline" onClick={() => handleStatusChange('new')}>
            <ArrowLeft size={14} style={{ marginRight: 6 }} /> Send Back
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>Description</h3>
            </div>
            <div style={{ padding: 20 }}>
              <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7 }}>{defect.description}</p>
            </div>
          </div>

          {/* Screenshot */}
          {defect.screenshot && (
            <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>Screenshot</h3>
              </div>
              <div style={{ padding: 20 }}>
                <img src={defect.screenshot} alt="Defect screenshot" className="w-full rounded-lg border border-slate-200" />
              </div>
            </div>
          )}

          {/* Comment thread */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={16} style={{ color: "#6B7280" }} />
                <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>Discussion ({comments.length})</h3>
              </div>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16 }}>
              {comments.length > 0 ? comments.map((comment) => (
                <div key={comment.id} style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: comment.userRole === 'manager' ? '#3b82f6' : comment.userRole === 'developer' ? '#8b5cf6' : '#f59e0b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 11, fontWeight: 600
                  }}>
                    {comment.userName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{comment.userName}</span>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, textTransform: 'capitalize',
                        background: comment.type === 'info-request' ? '#fef2f2' : comment.type === 'status-change' ? '#f0fdf4' : comment.type === 'assignment' ? '#fefce8' : '#f1f5f9',
                        color: comment.type === 'info-request' ? '#dc2626' : comment.type === 'status-change' ? '#16a34a' : comment.type === 'assignment' ? '#ca8a04' : '#475569'
                      }}>
                        {comment.type.replace('-', ' ')}
                      </span>
                      <span style={{ fontSize: 11, color: "#4B5563" }}>{comment.createdAt.toLocaleDateString('en-GB')}</span>
                    </div>
                    <p style={{ fontSize: 13, color: "#CBD5E1", marginTop: 4 }}>{comment.content}</p>
                  </div>
                </div>
              )) : (
                <p style={{ fontSize: 13, color: "#4B5563", textAlign: "center", padding: "16px 0" }}>No comments yet. Start the discussion below.</p>
              )}

              {/* Add comment */}
              <div style={{ paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 11, fontWeight: 600
                  }}>NG</div>
                  <div style={{ flex: 1 }}>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box" }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6B7280", background: "none", border: "none", cursor: "pointer", padding: "4px 0" }}>
                        <Paperclip size={14} /> Attach file
                      </button>
                      <Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}>
                        <Send size={14} style={{ marginRight: 4 }} /> Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Assignment */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <UserPlus size={14} /> Assignment
            </h3>
            {defect.assigneeName ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 12, fontWeight: 600
                }}>
                  {defect.assigneeName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{defect.assigneeName}</p>
                  <p className="text-xs" style={{ color: '#16a34a' }}>Assigned</p>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1.5">
                  <AlertCircle size={14} /> No one assigned yet
                </p>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none" }}
                >
                  <option value="">Select assignee...</option>
                  {mockUsers.map((user) => (
                    <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                  ))}
                </select>
                <Button onClick={handleAssign} disabled={!selectedAssignee} style={{ width: "100%" }} size="sm">
                  <UserPlus size={14} style={{ marginRight: 6 }} /> Assign
                </Button>
              </div>
            )}
          </div>

          {/* Reporter */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 12 }}>Reporter</h3>
            <div className="flex items-center gap-3 mb-4">
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 13, fontWeight: 600
              }}>
                {defect.reporterName.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC" }}>{defect.reporterName}</p>
                <p style={{ fontSize: 11, color: "#6B7280" }}>{defect.reporterEmail}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`mailto:${defect.reporterEmail}`} style={{ flex: 1 }}>
                <Button variant="outline" size="sm" style={{ width: "100%" }}>
                  <Mail size={14} style={{ marginRight: 6 }} /> Email
                </Button>
              </a>
              {defect.reporterPhone && (
                <a href={`tel:${defect.reporterPhone}`} style={{ flex: 1 }}>
                  <Button variant="outline" size="sm" style={{ width: "100%" }}>
                    <Phone size={14} style={{ marginRight: 6 }} /> Call
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#F8FAFC", marginBottom: 16 }}>Timeline</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ position: "relative" }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366F1', marginTop: 4 }} />
                  <div style={{ position: 'absolute', left: 3, top: 12, width: 2, height: 'calc(100% + 8px)', background: '#e2e8f0' }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Defect created</p>
                  <p style={{ fontSize: 11, color: "#6B7280" }}>by {defect.reporterName}</p>
                  <p style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{defect.createdAt.toLocaleDateString('en-GB')}</p>
                </div>
              </div>
              {defect.assigneeName && (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ position: "relative" }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', marginTop: 4 }} />
                    <div style={{ position: 'absolute', left: 3, top: 12, width: 2, height: 'calc(100% + 8px)', background: '#e2e8f0' }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Assigned to {defect.assigneeName}</p>
                    <p style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{defect.updatedAt.toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              )}
              {currentStatus === 'resolved' && (
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', marginTop: 4 }} />
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>Marked as resolved</p>
                    <p style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>{defect.updatedAt.toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};