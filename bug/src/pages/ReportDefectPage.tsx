import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../hooks/useProjects';
import { supabase } from '../lib/supabase';
import { FileUpload } from '../components/FileUpload';
import type { UploadedFile } from '../lib/upload';
import { notifyBugAssigned } from '../lib/notifications';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export const ReportDefectPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { projects } = useProjects(profile?.company_id || null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [severity, setSeverity] = useState<string>('major');
  const [priority, setPriority] = useState<string>('medium');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<UploadedFile[]>([]);

  const labelOptions = ['UI', 'Backend', 'Frontend', 'Authentication', 'Payment', 'Performance', 'Mobile', 'i18n', 'Email', 'Export', 'Finance', 'Search'];

  const priorityColors: Record<string, string> = {
    low: '#3dd68c', medium: '#e5a435', high: '#f09858', critical: '#f75f6b',
  };

  const severityColors: Record<string, string> = {
    minor: '#7c85a2', major: '#e5a435', severe: '#f09858', blocker: '#f75f6b',
  };

  useEffect(() => {
    if (!profile?.company_id) return;
    const fetchMembers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, email, avatar, role')
        .eq('company_id', profile.company_id);
      if (data) setTeamMembers(data);
    };
    fetchMembers();
  }, [profile?.company_id]);

  const toggleLabel = (label: string) => {
    setLabels(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedProject || !profile) {
      alert('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);

    const { data: newBug, error } = await supabase
      .from('bugs')
      .insert({
        project_id: selectedProject,
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: steps.trim() || null,
        expected_behavior: expected.trim() || null,
        actual_behavior: actual.trim() || null,
        priority,
        severity,
        reporter_id: profile.id,
        assignee_id: assignee || null,
        due_date: dueDate || null,
        labels,
        attachments: attachments.map(f => ({
          name: f.name, url: f.url, size: f.size, type: f.type, path: f.path,
        })),
        environment: {},
      })
      .select()
      .single();

    if (error) {
      console.error('Bug creation error:', error);
      alert('Error creating bug: ' + error.message + '\n' + (error.details || ''));
      setSubmitting(false);
      return;
    }
    if (newBug) {
      // Send notification if bug was assigned
      if (assignee) {
        const assigneeMember = teamMembers.find(m => m.id === assignee);
        if (assigneeMember) {
          const projectName = projects.find(p => p.id === selectedProject)?.name || '';
          notifyBugAssigned({
            bugId: newBug.id,
            bugTitle: title.trim(),
            assigneeId: assignee,
            assigneeName: assigneeMember.name,
            assigneeEmail: assigneeMember.email,
            actorName: profile.name || 'Unknown',
            actorEmail: profile.email || '',
            projectName,
          });
        }
      }
      navigate(`/dashboard/defects/${newBug.id}`);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>Report a Bug</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Describe the issue you've found</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Project */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Project *</label>
          <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box" }} required>
            <option value="">Select a project...</option>
            {projects.map((p) => (<option key={p.id} value={p.id}>{p.name}</option>))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief summary of the defect"
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box" }} required />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Description *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the bug in detail..." rows={4}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box" }} required />
        </div>

        {/* Steps to Reproduce */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Steps to Reproduce</label>
          <textarea value={steps} onChange={(e) => setSteps(e.target.value)} placeholder={"1. Navigate to...\n2. Click on...\n3. Observe..."} rows={4}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box", fontFamily: 'monospace' }} />
        </div>

        {/* Expected vs Actual */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Expected Behavior</label>
            <textarea value={expected} onChange={(e) => setExpected(e.target.value)} placeholder="What should happen..." rows={3}
              style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Actual Behavior</label>
            <textarea value={actual} onChange={(e) => setActual(e.target.value)} placeholder="What actually happens..." rows={3}
              style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Priority and Severity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Priority</label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map(p => (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{ background: priority === p ? `${priorityColors[p]}25` : 'rgba(255,255,255,0.03)', color: priority === p ? priorityColors[p] : '#6B7280', border: `1px solid ${priority === p ? priorityColors[p] + '40' : 'rgba(255,255,255,0.06)'}` }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Severity</label>
            <div className="flex gap-2">
              {['minor', 'major', 'severe', 'blocker'].map(s => (
                <button key={s} type="button" onClick={() => setSeverity(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all"
                  style={{ background: severity === s ? `${severityColors[s]}25` : 'rgba(255,255,255,0.03)', color: severity === s ? severityColors[s] : '#6B7280', border: `1px solid ${severity === s ? severityColors[s] + '40' : 'rgba(255,255,255,0.06)'}` }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Assignee */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Assignee</label>
          <select value={assignee} onChange={(e) => setAssignee(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box" }}>
            <option value="">Unassigned</option>
            {teamMembers.filter(m => m.id !== profile?.id).map(m => (
              <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Due Date</label>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box" }} />
        </div>

        {/* Labels */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Labels</label>
          <div className="flex flex-wrap gap-2">
            {labelOptions.map(l => (
              <button key={l} type="button" onClick={() => toggleLabel(l)}
                className="px-3 py-1 rounded-full text-xs font-medium transition-all"
                style={{ background: labels.includes(l) ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.03)', color: labels.includes(l) ? '#FB923C' : '#6B7280', border: `1px solid ${labels.includes(l) ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Attachments</label>
          <FileUpload
            onFilesUploaded={setAttachments}
            folder={`bugs/${selectedProject || 'general'}`}
            maxFiles={10}
            maxSizeMB={25}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={submitting || !title.trim() || !description.trim() || !selectedProject}>
            {submitting ? 'Creating...' : 'Report Bug'}
          </Button>
        </div>
      </form>
    </div>
  );
};
