import { useState, useEffect } from 'react';
import { X, Paperclip, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface CreateBugModalProps {
  onClose: () => void;
  onCreated?: (bugId: string) => void;
}

const priorities = ['low', 'medium', 'high', 'critical'];
const severities = ['low', 'medium', 'high', 'blocker'];
const labelOptions = ['UI', 'Backend', 'Frontend', 'Authentication', 'Payment', 'Performance', 'Mobile', 'i18n', 'Email', 'Export', 'Finance', 'Search'];

const priorityColors: Record<string, string> = {
  low: '#3dd68c', medium: '#e5a435', high: '#f09858', critical: '#f75f6b',
};
const severityColors: Record<string, string> = {
  low: '#3dd68c', medium: '#e5a435', high: '#f09858', blocker: '#f75f6b',
};

export default function CreateBugModal({ onClose, onCreated }: CreateBugModalProps) {
  const { profile } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState('medium');
  const [severity, setSeverity] = useState('medium');
  const [assignee, setAssignee] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.company_id) return;

    const fetchData = async () => {
      const { data: projectData } = await supabase
        .from('projects')
        .select('id, name')
        .eq('company_id', profile.company_id)
        .eq('status', 'active');

      const { data: memberData } = await supabase
        .from('profiles')
        .select('id, name, avatar, role')
        .eq('company_id', profile.company_id);

      setProjects(projectData || []);
      setTeamMembers(memberData || []);
    };

    fetchData();
  }, [profile?.company_id]);

  const toggleLabel = (l: string) => {
    setSelectedLabels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !project || !profile?.id || saving) return;

    setSaving(true);

    const { data: bug, error } = await supabase
      .from('bugs')
      .insert({
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: steps.trim(),
        expected_behavior: expected.trim(),
        actual_behavior: actual.trim(),
        project_id: project,
        priority,
        severity,
        status: 'open',
        reporter_id: profile.id,
        assignee_id: assignee || null,
        labels: selectedLabels,
        due_date: dueDate || null,
      })
      .select()
      .single();

    if (!error && bug) {
      // Log activity
      await supabase.from('bug_activity').insert({
        bug_id: bug.id,
        actor_id: profile.id,
        action: 'created',
        detail: `Created bug "${title.trim()}"`,
      });

      onCreated?.(bug.id);
      onClose();
    }

    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <div
        className="flex flex-col w-full max-w-2xl max-h-[90vh] rounded-xl overflow-hidden"
        style={{ background: '#141826', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#e8eaf0' }}>Create New Bug</h2>
          <button onClick={onClose} style={{ color: '#7c85a2' }} onMouseEnter={e => (e.currentTarget.style.color = '#d9dff0')} onMouseLeave={e => (e.currentTarget.style.color = '#7c85a2')}>
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Title */}
          <FormField label="Bug Title" required>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Short, descriptive title..."
              className="w-full px-3 py-2 rounded-md text-sm outline-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </FormField>

          {/* Project + Priority + Severity row */}
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Project" required>
              <Select value={project} onChange={setProject} placeholder="Select project">
                {projects.map(p => <option key={p.id} value={p.id} style={{ background: '#141826' }}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Priority">
              <div className="flex gap-1.5 flex-wrap">
                {priorities.map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className="px-2 py-1 rounded text-xs font-medium capitalize transition-all"
                    style={{
                      background: priority === p ? `${priorityColors[p]}25` : 'rgba(255,255,255,0.05)',
                      color: priority === p ? priorityColors[p] : '#484f6b',
                      border: `1px solid ${priority === p ? priorityColors[p] + '40' : 'transparent'}`,
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label="Severity">
              <div className="flex gap-1.5 flex-wrap">
                {severities.map(s => (
                  <button
                    key={s}
                    onClick={() => setSeverity(s)}
                    className="px-2 py-1 rounded text-xs font-medium capitalize transition-all"
                    style={{
                      background: severity === s ? `${severityColors[s]}25` : 'rgba(255,255,255,0.05)',
                      color: severity === s ? severityColors[s] : '#484f6b',
                      border: `1px solid ${severity === s ? severityColors[s] + '40' : 'transparent'}`,
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </FormField>
          </div>

          {/* Description */}
          <FormField label="Description">
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the bug in detail..."
              rows={3}
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </FormField>

          {/* Steps */}
          <FormField label="Steps to Reproduce">
            <textarea
              value={steps}
              onChange={e => setSteps(e.target.value)}
              placeholder={"1. Navigate to...\n2. Click on...\n3. Observe..."}
              rows={3}
              className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none transition-colors"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0', fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}
              onFocus={e => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.5)')}
              onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Expected Result">
              <textarea
                value={expected}
                onChange={e => setExpected(e.target.value)}
                placeholder="What should happen..."
                rows={2}
                className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(61,214,140,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </FormField>
            <FormField label="Actual Result">
              <textarea
                value={actual}
                onChange={e => setActual(e.target.value)}
                placeholder="What actually happens..."
                rows={2}
                className="w-full px-3 py-2 rounded-md text-sm outline-none resize-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
                onFocus={e => (e.currentTarget.style.borderColor = 'rgba(247,95,107,0.4)')}
                onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
              />
            </FormField>
          </div>

          {/* Assignee + Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Assignee">
              <Select value={assignee} onChange={setAssignee} placeholder="Select assignee">
                {teamMembers.map(m => (
                  <option key={m.id} value={m.id} style={{ background: '#141826' }}>{m.name} ({m.role})</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Due Date">
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#d9dff0' }}
              />
            </FormField>
          </div>

          {/* Labels */}
          <FormField label="Labels">
            <div className="flex flex-wrap gap-1.5">
              {labelOptions.map(l => (
                <button
                  key={l}
                  onClick={() => toggleLabel(l)}
                  className="px-2 py-0.5 rounded text-xs transition-all"
                  style={{
                    background: selectedLabels.includes(l) ? 'rgba(251,146,60,0.2)' : 'rgba(255,255,255,0.05)',
                    color: selectedLabels.includes(l) ? '#FB923C' : '#7c85a2',
                    border: `1px solid ${selectedLabels.includes(l) ? 'rgba(251,146,60,0.4)' : 'transparent'}`,
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </FormField>

          {/* Attachments */}
          <FormField label="Attachments">
            <button
              className="flex items-center gap-2 px-3 py-2 rounded-md text-xs w-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)', color: '#484f6b' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(251,146,60,0.4)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)')}
            >
              <Paperclip size={13} />
              <span>Drop files here or click to upload (screenshots, videos, files)</span>
            </button>
          </FormField>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-3 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md text-sm transition-colors"
            style={{ color: '#7c85a2', background: 'rgba(255,255,255,0.05)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !project || saving}
            className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
            style={{
              background: title.trim() && project && !saving ? '#FB923C' : 'rgba(255,255,255,0.06)',
              color: title.trim() && project && !saving ? '#fff' : '#484f6b',
              cursor: title.trim() && project && !saving ? 'pointer' : 'default',
            }}
          >
            {saving ? 'Creating...' : 'Create Bug'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block" style={{ color: '#7c85a2' }}>
        {label}{required && <span style={{ color: '#f75f6b' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

function Select({ value, onChange, placeholder, children }: { value: string; onChange: (v: string) => void; placeholder: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 rounded-md text-sm outline-none appearance-none transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: value ? '#d9dff0' : '#484f6b' }}
      >
        <option value="" disabled style={{ background: '#141826' }}>{placeholder}</option>
        {children}
      </select>
      <ChevronDown size={13} color="#484f6b" className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
