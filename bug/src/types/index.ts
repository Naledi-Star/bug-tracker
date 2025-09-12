export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'developer' | 'tester' | 'manager';
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  members: User[];
  status: 'active' | 'completed' | 'on-hold';
}

export interface Defect {
  id: string;
  title: string;
  description: string;
  projectId: string;
  projectName: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'assigned' | 'in-progress' | 'resolved' | 'closed';
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  reporterEmail: string;
  createdAt: Date;
  updatedAt: Date;
  screenshot?: string;
}