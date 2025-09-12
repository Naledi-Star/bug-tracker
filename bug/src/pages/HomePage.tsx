import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ProjectCard } from '../components/ProjectCard';
import { DefectsCard } from '../components/DefectsCard';
import { mockProjects, mockDefects } from '../data/mockData';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProject = () => {
    navigate('/projects/new');
  };

  const handleAddDefect = () => {
    navigate('/defects/new');
  };

  const handleSeeMoreDefects = () => {
    navigate('/defects');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your projects and defects.</p>
      </div>

      {/* Projects Section */}
      <ProjectCard
        projects={mockProjects}
        onAddProject={handleAddProject}
        onNewDefect={handleAddDefect}
      />

      {/* Defects Section */}
      <DefectsCard
        defects={mockDefects}
        onAddProject={handleAddProject}
        onAddDefect={handleAddDefect}
        onSeeMoreDefects={handleSeeMoreDefects}
      />
    </div>
  );
};