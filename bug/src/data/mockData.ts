import { User, Project, Defect } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'N. Galeragwe',
    email: 'n.galeragwe@galeragwe.co.bw',
    role: 'manager'
  },
  {
    id: '2',
    name: 'Nale Nale',
    email: 'nale.nale@galeragwe.co.bw',
    role: 'developer'
  },
  {
    id: '3',
    name: 'Star Gale',
    email: 'star.gale@galeragwe.co.bw',
    role: 'tester'
  },
  {
    id: '4',
    name: 'Mike Gale',
    email: 'mike@galeragwe.co.bw',
    role: 'developer'
  }
];

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'Online shopping platform with payment integration',
    createdAt: new Date('2024-01-15'),
    members: [mockUsers[0], mockUsers[1], mockUsers[2]],
    status: 'active'
  },
  {
    id: '2',
    name: 'Mobile Banking App',
    description: 'Secure mobile banking application',
    createdAt: new Date('2024-02-21'),
    members: [mockUsers[0], mockUsers[3]],
    status: 'active'
  },
  {
    id: '3',
    name: 'CRM System',
    description: 'Customer relationship management system',
    createdAt: new Date('2024-01-20'),
    members: [mockUsers[1], mockUsers[2], mockUsers[3]],
    status: 'on-hold'
  }
];

export const mockDefects: Defect[] = [
  {
    id: '1',
    title: 'Unable to assign user roles',
    description: 'When trying to assign roles to users, the system throws an error and does not save the changes.',
    projectId: '1',
    projectName: 'E-Commerce Platform',
    severity: 'high',
    status: 'assigned',
    assigneeId: '2',
    assigneeName: 'Nale Nale',
    reporterId: '3',
    reporterName: 'Star Gale',
    reporterEmail: 'star.gale@galeragwe.co.bw',
    createdAt: new Date('2024-02-02'),
    updatedAt: new Date('2024-02-12'),
    screenshot: 'https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: '2',
    title: 'Cannot add screenshot to defect',
    description: 'The file upload functionality for screenshots is not working properly.',
    projectId: '1',
    projectName: 'E-Commerce Platform',
    severity: 'medium',
    status: 'in-progress',
    assigneeId: '1',
    assigneeName: 'N. Galeragwe',
    reporterId: '2',
    reporterName: 'Nale Nale',
    reporterEmail: 'nale.nale@galeragwe.co.bw',
    createdAt: new Date('2024-12-02'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '3',
    title: 'Error when adding new defect',
    description: 'Application crashes when trying to create a new defect entry.',
    projectId: '2',
    projectName: 'Mobile Banking App',
    severity: 'critical',
    status: 'new',
    reporterId: '3',
    reporterName: 'Star Gale',
    reporterEmail: 'star.gale@galeragwe.co.bw',
    createdAt: new Date('2024-12-03'),
    updatedAt: new Date('2024-12-03')
  },
  {
    id: '4',
    title: 'Login page not responsive',
    description: 'The login page does not display correctly on mobile devices.',
    projectId: '2',
    projectName: 'Mobile Banking App',
    severity: 'medium',
    status: 'assigned',
    assigneeId: '4',
    assigneeName: 'Mike Gale',
    reporterId: '1',
    reporterName: 'N. Galeragwe',
    reporterEmail: 'n.galeragwe@galeragwe.co.bw',
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2024-12-02')
  },
  {
    id: '5',
    title: 'Database connection timeout',
    description: 'Intermittent database connection timeouts causing application errors.',
    projectId: '3',
    projectName: 'CRM System',
    severity: 'high',
    status: 'resolved',
    assigneeId: '2',
    assigneeName: 'Nale Nale',
    reporterId: '4',
    reporterName: 'Mike Gale',
    reporterEmail: 'mike@galeragwe.co.bw',
    createdAt: new Date('2024-11-28'),
    updatedAt: new Date('2024-12-01')
  }
];