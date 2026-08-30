import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import './project-card.css';

interface ProjectCardProps {
  projects: Project[];
  onAddProject: () => void;
  onNewDefect: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  projects,
  onAddProject,
  onNewDefect,
}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 3;
  const totalPages = Math.ceil(projects.length / projectsPerPage);

  const currentProjects = projects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const getStatusClass = (status: string) => {
    switch(status) {
      case 'active': return 'project-status-active';
      case 'completed': return 'project-status-completed';
      default: return 'project-status-maintenance';
    }
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-card-title">PROJECTS</div>
      </div>

      <div className="project-card-body">
        <div className="project-card-layout">
          <div className="project-list">
            <div className="project-list-items">
              {currentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/dashboard/projects/${project.id}`)}
                  className="project-item"
                >
                  <div className="project-item-header">
                    <span className="project-item-name">{project.name}</span>
                    <span className={`badge ${getStatusClass(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="project-item-description">{project.description}</p>
                </div>
              ))}
            </div>

            <div className="project-pagination">
              <div className="project-pagination-controls">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="project-pagination-btn"
                >
                  <ChevronLeft />
                </button>
                <div className="project-pagination-number">
                  <span>{currentPage}</span>
                </div>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="project-pagination-btn"
                >
                  <ChevronRight />
                </button>
              </div>

              <button onClick={onAddProject} className="project-add-btn">
                <span>Add Project</span>
                <Plus />
              </button>
            </div>
          </div>

          <div className="project-profile">
            <Avatar className="project-profile-avatar">
              <AvatarFallback>NG</AvatarFallback>
            </Avatar>
            <span className="project-profile-name">N. Galeragwe</span>

            <button onClick={onNewDefect} className="project-new-defect-btn">
              <span>New defect</span>
              <span className="project-defect-count">5</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
