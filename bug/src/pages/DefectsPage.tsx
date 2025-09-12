import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Search, Plus, Filter, Bug } from 'lucide-react';
import { mockDefects } from '../data/mockData';
import { Defect } from '../types';

export const DefectsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [defects] = useState<Defect[]>(mockDefects);

  const filteredDefects = defects.filter(defect => {
    const matchesSearch = defect.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         defect.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || defect.status === statusFilter;
    const matchesSeverity = severityFilter === 'all' || defect.severity === severityFilter;
    
    return matchesSearch && matchesStatus && matchesSeverity;
  });

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

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Defects</h1>
          <p className="text-gray-600">Track and manage all reported defects across projects</p>
        </div>
        <Button 
          onClick={() => navigate('/defects/new')}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Report Defect
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search defects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setSeverityFilter('all');
              }}
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Defects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Defects ({filteredDefects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDefects.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Title</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Assignee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Reporter</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDefects.map((defect) => (
                    <tr 
                      key={defect.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => navigate(`/defects/${defect.id}`)}
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{defect.title}</p>
                          <p className="text-sm text-gray-600 line-clamp-1">{defect.description}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                          {defect.projectName}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getStatusColor(defect.status)} text-white`}>
                          {defect.status.replace('-', ' ')}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={`${getSeverityColor(defect.severity)} text-white`}>
                          {defect.severity}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        {defect.assigneeName ? (
                          <span className="text-gray-900">{defect.assigneeName}</span>
                        ) : (
                          <Badge variant="outline" className="text-blue-600 border-blue-600">
                            Unassigned
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900">{defect.reporterName}</p>
                          <p className="text-sm text-gray-600">{defect.reporterEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {defect.createdAt.toLocaleDateString('en-GB')}
                      </td>
                      <td className="py-4 px-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/defects/${defect.id}`);
                          }}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No defects found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' || severityFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No defects have been reported yet'}
              </p>
              <Button 
                onClick={() => navigate('/defects/new')}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Report First Defect
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};