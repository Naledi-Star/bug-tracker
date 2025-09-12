import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';

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

  return (
    <Card className="w-full bg-white rounded-3xl border-2 border-blue-400 shadow-lg">
      <CardHeader className="bg-blue-100 rounded-t-3xl">
        <CardTitle className="text-lg font-normal text-black px-4 py-2">
          PROJECTS
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {/* Projects List */}
            <div className="space-y-3 mb-6">
              {currentProjects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="p-4 bg-white border border-blue-200 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-black font-medium">{project.name}</span>
                    <Badge className={`${project.status === 'active' ? 'bg-green-500' : project.status === 'completed' ? 'bg-blue-500' : 'bg-yellow-500'} text-white text-xs`}>
                      {project.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                
                <div className="w-8 h-8 border border-black flex items-center justify-center bg-white">
                  <span className="text-sm font-medium">{currentPage}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </div>

              <Button
                variant="ghost"
                onClick={onAddProject}
                className="flex items-center space-x-2 text-black hover:text-blue-600"
              >
                <span>Add Project</span>
                <Plus className="w-6 h-6" />
              </Button>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-col items-center ml-8">
            <Avatar className="w-24 h-24 border-2 border-blue-400 mb-3">
              <AvatarFallback className="bg-white text-blue-600 text-xl font-bold">
                NG
              </AvatarFallback>
            </Avatar>
            <span className="text-black font-medium mb-4">N. Galeragwe</span>
            
            <Button
              onClick={onNewDefect}
              variant="outline"
              className="flex items-center space-x-2 border-blue-500 text-black hover:bg-blue-50"
            >
              <span>New defect</span>
              <Badge className="bg-red-500 text-white rounded-full">
                <span className="font-bold">5</span>
              </Badge>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};