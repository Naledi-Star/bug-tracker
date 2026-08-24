import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, X, Plus } from 'lucide-react';
import { mockUsers } from '../data/mockData';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const toggleMember = (userId: string) => {
    setSelectedMembers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
    alert(`Project "${name}" created successfully!`);
    navigate('/projects');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>New Project</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Create a new project for your team</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Name */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Project Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. E-Commerce Platform"
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box" }}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Description *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the project..."
            rows={4}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box" }}
            required
          />
        </div>

        {/* Status */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Status</label>
          <div style={{ display: "flex", gap: 8 }}>
            {['active', 'on-hold', 'completed'].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={status === s
                  ? { background: '#eff6ff', color: '#2563eb', fontWeight: 600 }
                  : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }
                }
              >
                {s.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Team Members */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Team Members</label>
          <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 12 }}>Select who should be part of this project</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {mockUsers.map((user) => {
              const isSelected = selectedMembers.includes(user.id);
              return (
                <div
                  key={user.id}
                  onClick={() => toggleMember(user.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  style={isSelected
                    ? { background: '#eff6ff', borderColor: '#3b82f6' }
                    : { background: 'white', borderColor: '#e2e8f0' }
                  }
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: user.role === 'manager' ? '#6366F1' : user.role === 'developer' ? '#8B5CF6' : '#F59E0B',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 11, fontWeight: 600
                  }}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{user.name}</p>
                    <p style={{ fontSize: 11, color: "#6B7280", textTransform: "capitalize" }}>{user.role}</p>
                  </div>
                  {isSelected && (
                    <div style={{ width: 20, height: 20, borderRadius: 4, background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: 'white', fontSize: 12 }}>✓</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button type="submit" style={{ flex: 1 }}>
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
};
