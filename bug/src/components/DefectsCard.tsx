import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Defect } from '../types';

interface DefectsCardProps {
  defects: Defect[];
  onAddProject: () => void;
  onAddDefect: () => void;
  onSeeMoreDefects: () => void;
}

const statusColors = {
  new: 'bg-blue-500',
  assigned: 'bg-yellow-500',
  'in-progress': 'bg-orange-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

export const DefectsCard: React.FC<DefectsCardProps> = ({
  defects,
  onAddProject,
  onAddDefect,
  onSeeMoreDefects,
}) => {
  const navigate = useNavigate();
  const displayedDefects = defects.slice(0, 3);

  return (
    <Card className="w-full bg-white rounded-3xl border-2 border-blue-400 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-black">DEFECTS</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Defects List */}
        <div className="space-y-3">
          {displayedDefects.map((defect) => (
            <div
              key={defect.id}
              onClick={() => navigate(`/defects/${defect.id}`)}
              className="flex items-center justify-between p-4 bg-white border border-blue-500 rounded-lg hover:border-blue-600 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <span className="text-black font-medium block">
                  {defect.title}
                </span>
                <span className="text-sm text-gray-600">
                  {defect.projectName} • {defect.reporterName}
                </span>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Badge
                  className={`${statusColors[defect.status]} text-white capitalize`}
                >
                  {defect.status.replace('-', ' ')}
                </Badge>
                <Badge
                  className={`${defect.severity === 'critical' ? 'bg-red-500' : defect.severity === 'high' ? 'bg-orange-500' : defect.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'} text-white text-xs`}
                >
                  {defect.severity}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* See more defects link */}
        {defects.length > 3 && (
          <div className="pt-2">
            <button
              onClick={onSeeMoreDefects}
              className="text-black font-bold text-xl underline hover:text-blue-600 transition-colors"
            >
              See more defects
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6">
          <Button
            onClick={onAddProject}
            variant="outline"
            className="flex-1 h-16 bg-white rounded-full border-blue-500 text-black font-bold text-xl hover:bg-blue-50"
          >
            Add projects
          </Button>
          
          <Button
            onClick={onAddDefect}
            variant="outline"
            className="flex-1 h-16 bg-white rounded-full border-blue-500 text-black font-bold text-xl hover:bg-blue-50"
          >
            Add defects
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};