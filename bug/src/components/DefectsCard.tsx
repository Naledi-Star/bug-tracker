import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Defect } from '../types';
import './defect-card.css';

interface DefectsCardProps {
  defects: Defect[];
  onAddProject: () => void;
  onAddDefect: () => void;
  onSeeMoreDefects: () => void;
}

export const DefectsCard: React.FC<DefectsCardProps> = ({
  defects,
  onAddProject,
  onAddDefect,
  onSeeMoreDefects,
}) => {
  const navigate = useNavigate();
  const displayedDefects = defects.slice(0, 3);

  const getStatusClass = (status: string) => {
    return `defect-status-${status}`;
  };

  const getSeverityClass = (severity: string) => {
    return `defect-severity-${severity}`;
  };
//
  return (
    <div className="defects-card">
      <div className="defects-card-header">
        <div className="defects-card-title">DEFECTS</div>
      </div>

      <div className="defects-card-body">
        <div className="defects-list">
          {displayedDefects.map((defect) => (
            <div
              key={defect.id}
              onClick={() => navigate(`/dashboard/defects/${defect.id}`)}
              className="defect-item"
            >
              <div className="defect-info">
                <span className="defect-title">{defect.title}</span>
                <span className="defect-meta">
                  {defect.projectName} • {defect.reporterName}
                </span>
              </div>
              <div className="defect-badges">
                <span className={`badge capitalize ${getStatusClass(defect.status)}`}>
                  {defect.status.replace('-', ' ')}
                </span>
                <span className={`badge ${getSeverityClass(defect.severity)}`}>
                  {defect.severity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {defects.length > 3 && (
          <div className="defects-see-more">
            <button onClick={onSeeMoreDefects} className="defects-see-more-btn">
              See more defects
            </button>
          </div>
        )}

        <div className="defects-actions">
          <button onClick={onAddProject} className="defects-action-btn">
            Add projects
          </button>
          <button onClick={onAddDefect} className="defects-action-btn">
            Add defects
          </button>
        </div>
      </div>
    </div>
  );
};
