import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ArrowLeft, Edit, User, Calendar, AlertTriangle, FolderOpen, Mail, Phone } from 'lucide-react';
import { mockDefects, mockUsers } from '../data/mockData';

export const DefectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const defect = mockDefects.find(d => d.id === id);
  const [selectedAssignee, setSelectedAssignee] = useState(defect?.assigneeId || '');

  if (!defect) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Defect not found</h2>
        <Button onClick={() => navigate('/defects')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Defects
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-500';
      case 'assigned': return 'bg-yellow-500';
      case 'in-progress': return 'bg-orange-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleAssignDefect = () => {
    if (selectedAssignee) {
      const assignee = mockUsers.find(u => u.id === selectedAssignee);
      if (assignee) {
        // In a real app, this would update the backend
        console.log(`Assigning defect ${defect.id} to ${assignee.name}`);
        alert(`Defect assigned to ${assignee.name}`);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/defects')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{defect.title}</h1>
            <p className="text-gray-600">Defect #{defect.id}</p>
          </div>
        </div>
        <Button variant="outline">
          <Edit className="w-4 h-4 mr-2" />
          Edit Defect
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${getStatusColor(defect.status)} text-white`}>
              {defect.status.replace('-', ' ')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Severity</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={`${getSeverityColor(defect.severity)} text-white`}>
              {defect.severity}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FolderOpen className="w-4 h-4 mr-2 text-gray-400" />
              <span 
                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                onClick={() => navigate(`/projects/${defect.projectId}`)}
              >
                {defect.projectName}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
              <span>{defect.createdAt.toLocaleDateString('en-GB')}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Defect Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{defect.description}</p>
            </CardContent>
          </Card>

          {/* Screenshot */}
          {defect.screenshot && (
            <Card>
              <CardHeader>
                <CardTitle>Screenshot</CardTitle>
              </CardHeader>
              <CardContent>
                <img 
                  src={defect.screenshot} 
                  alt="Defect screenshot"
                  className="w-full rounded-lg border"
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Assignment & Reporter Info */}
        <div className="space-y-6">
          {/* Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-4 h-4 mr-2" />
                Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {defect.assigneeName ? (
                <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Avatar>
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {defect.assigneeName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-green-900">{defect.assigneeName}</p>
                    <p className="text-sm text-green-700">Assigned</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                    <span className="text-yellow-800 font-medium">Unassigned</span>
                  </div>
                  <div className="space-y-3">
                    <select
                      value={selectedAssignee}
                      onChange={(e) => setSelectedAssignee(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select assignee...</option>
                      {mockUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                    <Button 
                      onClick={handleAssignDefect}
                      disabled={!selectedAssignee}
                      className="w-full"
                    >
                      Assign Defect
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reporter Information */}
          <Card>
            <CardHeader>
              <CardTitle>Reporter Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <Avatar>
                  <AvatarFallback>
                    {defect.reporterName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{defect.reporterName}</p>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      <a 
                        href={`mailto:${defect.reporterEmail}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        {defect.reporterEmail}
                      </a>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      Reported on {defect.createdAt.toLocaleDateString('en-GB')}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Defect created</p>
                    <p className="text-xs text-gray-600">{defect.createdAt.toLocaleDateString('en-GB')}</p>
                  </div>
                </div>
                {defect.assigneeName && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Assigned to {defect.assigneeName}</p>
                      <p className="text-xs text-gray-600">{defect.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {defect.status === 'resolved' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="text-sm font-medium">Defect resolved</p>
                      <p className="text-xs text-gray-600">{defect.updatedAt.toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};