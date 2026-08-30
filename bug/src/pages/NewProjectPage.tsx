import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

const COLORS = ['#FB923C', '#3dd68c', '#e5a435', '#f75f6b', '#9b7cf4', '#f09858', '#22d3ee', '#ec4899'];

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [submitting, setSubmitting] = useState(false);

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

  const toggleMember = (id: string) => {
    setSelectedMembers(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !profile?.id || !profile?.company_id) return;
    setSubmitting(true);

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        name: name.trim(),
        description: description.trim() || null,
        color,
        company_id: profile.company_id,
        created_by: profile.id,
        status: 'active',
      })
      .select()
      .single();

    if (!error && project) {
      // Add selected members + creator
      const members = new Set([profile.id, ...selectedMembers]);
      const memberRows = Array.from(members).map(id => ({
        project_id: project.id,
        profile_id: id,
        role: id === profile.id ? 'project_manager' : 'member',
      }));

      await supabase.from('project_members').insert(memberRows);
      navigate(`/dashboard/projects/${project.id}`);
    }

    setSubmitting(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          onClick={() => navigate('/dashboard/projects')}
          style={{ padding: 8, borderRadius: 8, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <ArrowLeft style={{ width: 16, height: 16, color: '#9CA3AF' }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.03em' }}>New Project</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Create a new project and invite your team</p>
        </div>
      </div>

      {/* Form */}
      <div style={{ background: '#1a1a2e', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', padding: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c85a2', marginBottom: 6, display: 'block' }}>Project Name *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., Mobile App v2.0"
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, color: '#F8FAFC', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c85a2', marginBottom: 6, display: 'block' }}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: 14, color: '#F8FAFC', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
            />
          </div>

          {/* Color Picker */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c85a2', marginBottom: 6, display: 'block' }}>Color</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', border: c === color ? '2px solid white' : '2px solid transparent',
                    background: c, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {c === color && <Check size={14} color="white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#7c85a2', marginBottom: 6, display: 'block' }}>Team Members</label>
            <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 8 }}>Select who should be part of this project</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {teamMembers.filter(m => m.id !== profile?.id).map(member => {
                const isSelected = selectedMembers.includes(member.id);
                return (
                  <div
                    key={member.id}
                    onClick={() => toggleMember(member.id)}
                    className="flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: isSelected ? 'rgba(251,146,60,0.1)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isSelected ? 'rgba(251,146,60,0.3)' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: `${member.role === 'admin' ? '#6366F1' : '#8B5CF6'}20`,
                      color: member.role === 'admin' ? '#6366F1' : '#8B5CF6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700,
                    }}>
                      {member.avatar?.length <= 2 ? member.avatar : member.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#d9dff0' }}>{member.name}</p>
                      <p style={{ fontSize: 11, color: '#484f6b' }}>{member.email}</p>
                    </div>
                    <div
                      style={{
                        width: 20, height: 20, borderRadius: 4,
                        border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        background: isSelected ? '#FB923C' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      {isSelected && <Check size={12} color="white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
        <Button variant="outline" onClick={() => navigate('/dashboard/projects')}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!name.trim() || submitting}>
          {submitting ? 'Creating...' : 'Create Project'}
        </Button>
      </div>
    </div>
  );
};
