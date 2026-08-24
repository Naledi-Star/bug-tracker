import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { mockProjects, mockUsers } from '../data/mockData';

export const ReportDefectPage: React.FC = () => {
  const navigate = useNavigate();
  const { id: projectId } = useParams<{ id: string }>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<string>('medium');
  const [selectedProject, setSelectedProject] = useState(projectId || '');
  const [screenshotName, setScreenshotName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedProject) {
      alert('Please fill in all required fields.');
      return;
    }
    alert(`Defect "${title}" reported successfully!`);
    navigate(projectId ? `/projects/${projectId}` : '/defects');
  };

  const getSeverityPreview = (sev: string) => {
    const styles: Record<string, React.CSSProperties> = {
      low: { background: 'rgba(34,197,94,0.15)', color: '#86EFAC' },
      medium: { background: 'rgba(250,204,21,0.15)', color: '#FDE047' },
      high: { background: '#fff7ed', color: '#ea580c' },
      critical: { background: '#fef2f2', color: '#dc2626' },
    };
    return { fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 8, ...(styles[sev] || styles['medium']) };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate(-1)} style={{ padding: 8, borderRadius: 8, background: "rgba(255,255,255,0.05)", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
          <ArrowLeft style={{ width: 16, height: 16, color: "#9CA3AF" }} />
        </button>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#F8FAFC", letterSpacing: "-0.03em" }}>Report a Defect</h1>
          <p style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>Describe the issue you've found</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: "#1a1a2e", borderRadius: 14, border: "1px solid rgba(255,255,255,0.06)", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Project */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Project *</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", boxSizing: "border-box" }}
            required
          >
            <option value="">Select a project...</option>
            {mockProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief summary of the defect"
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
            placeholder="Steps to reproduce, expected vs actual behavior..."
            rows={5}
            style={{ width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, fontSize: 13, color: "#F8FAFC", outline: "none", resize: "none", boxSizing: "border-box" }}
            required
          />
        </div>

        {/* Severity */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Severity *</label>
          <div style={{ display: "flex", gap: 8 }}>
            {['low', 'medium', 'high', 'critical'].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverity(sev)}
                className="flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-all"
                style={severity === sev
                  ? getSeverityPreview(sev)
                  : { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0' }
                }
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Screenshot */}
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#CBD5E1", marginBottom: 6 }}>Screenshot (optional)</label>
          <div style={{ border: "2px dashed rgba(255,255,255,0.08)", borderRadius: 10, padding: 24, textAlign: "center", cursor: "pointer" }}>
            {screenshotName ? (
              <div className="flex items-center justify-center gap-2">
                <span style={{ fontSize: 13, color: "#CBD5E1" }}>{screenshotName}</span>
                <button type="button" onClick={() => setScreenshotName('')} style={{ color: "#4B5563" }}>
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} style={{ color: "#4B5563", margin: "0 auto 8px" }} />
                <p className="text-sm text-slate-500">Click to upload or drag and drop</p>
                <p style={{ fontSize: 11, color: "#4B5563", marginTop: 4 }}>PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
        </div>

        {/* Reporter info */}
        <div style={{ padding: 12, background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#6B7280" }}>Reporting as</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#CBD5E1" }}>{mockUsers[0].name} ({mockUsers[0].email})</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button type="submit" style={{ flex: 1 }}>
            Submit Defect
          </Button>
        </div>
      </form>
    </div>
  );
};
